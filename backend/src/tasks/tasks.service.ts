// tasks.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, TestSubmissionStatus, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, SubmitTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    // Check if user is a teacher

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new ForbiddenException('Only teachers can create tasks');
    }

    // Check if teacher teaches the subject
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: { teacherId: teacher.id, subjectId: createTaskDto.subjectId },
    });
    if (!teacherSubject) {
      throw new ForbiddenException(
        'You can only create tasks for subjects you teach',
      );
    }

    // Convert base64 to Buffer if provided
    const fileContent = createTaskDto.fileContent
      ? Buffer.from(createTaskDto.fileContent, 'base64')
      : null;

    // Validate deadline is in the future
    const deadline = new Date(createTaskDto.deadline);
    const now = new Date();
    if (deadline <= now) {
      throw new BadRequestException('Deadline must be in the future');
    }

    try {
      const task = await this.prisma.task.create({
        data: {
          title: createTaskDto.title,
          description: createTaskDto.description ?? '',
          subjectId: createTaskDto.subjectId,
          deadline,
          teacherId: teacher.id,
          fileContent,
        },
        include: { subject: true, teacher: { include: { user: true } } },
      });

      const subject = await this.prisma.subject.findUnique({
        where: { id: Number(createTaskDto.subjectId) },
        select: {
          name: true,
          groups: {
            select: {
              group: {
                select: {
                  students: {
                    select: {
                      user: { select: { id: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!subject) throw new BadRequestException('Предмет не найден');

      const userIds = subject.groups.flatMap((g) =>
        g.group.students.map((s) => s.user.id),
      );

      for (const id of userIds) {
        await this.prisma.notification.create({
          data: {
            users: { connect: { id } },
            text: `По уроку ${subject.name} появилось новое задание`,
            status: 'LOW',
          },
        });
      }

      return task;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Unique constraint violation');
        }
      }
      throw error;
    }
  }

  async findAll(userId: number, role: 'admin' | 'student' | 'teacher') {
    if (role === 'admin') {
      return this.prisma.task.findMany({
        include: {
          subject: true,
          submissions: true,
          teacher: { include: { user: true } },
        },
      });
    }

    if (role === 'teacher') {
      return this.prisma.task.findMany({
        where: {
          teacher: {
            userId,
          },
        },
        include: {
          subject: true,
          submissions: true,
          teacher: { include: { user: true } },
        },
      });
    }

    return this.prisma.task.findMany({
      where: {
        subject: {
          groups: {
            some: {
              group: {
                students: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        subject: true,
        submissions: {
          where: {
            student: {
              userId,
            },
          },
          include: {
            student: { include: { user: true } },
          },
        },
        teacher: { include: { user: true } },
      },
    });
  }

  async findOne(id: number, user: User & { role: string; userId: number }) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        submissions: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (user.role === 'student') {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.userId },
        include: {
          group: { include: { subjects: { include: { subject: true } } } },
        },
      });
      if (!student || !student.group) {
        throw new ForbiddenException(
          'User is not a registered student or group is missing',
        );
      }
      if (!student.group.subjects.some((s) => s.subjectId === task.subjectId)) {
        throw new ForbiddenException('You do not have access to this task');
      }

      // Проверка на предыдущую сдачу задачи
      const studentSubmissions = task.submissions.filter(
        (submission) => submission.studentId === student.id,
      );

      if (
        studentSubmissions.some((submission) =>
          ['PENDING', 'APPROVED'].includes(submission.status),
        )
      ) {
        return {
          message: studentSubmissions.map((submission) => submission.status)[0],
        };
      }
      // Если статус rejected или нет submissions, продолжаем отдавать задачу
    }

    const now = new Date();
    const isExpired = task.deadline ? task.deadline < now : false;
    const timeRemaining = task.deadline
      ? Math.max(0, task.deadline.getTime() - now.getTime())
      : null;

    return {
      ...task,
      uploadDate: task.uploadDate.toISOString(),
      deadline: task.deadline?.toISOString() || null,
      isExpired,
      timeRemaining,
    };
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    // Find the task and check ownership
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.teacher.userId !== userId) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    // Convert base64 to Buffer if provided
    const fileContent = updateTaskDto.fileContent
      ? Buffer.from(updateTaskDto.fileContent, 'base64')
      : undefined;

    // Prepare data, handling optionals
    const data: any = {};
    if (updateTaskDto.title !== undefined) data.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      data.description = updateTaskDto.description;
    if (updateTaskDto.deadline) {
      const deadline = new Date(updateTaskDto.deadline);
      const now = new Date();
      if (deadline <= now) {
        throw new BadRequestException('Deadline must be in the future');
      }
      data.deadline = deadline;
    }
    if (fileContent !== undefined) data.fileContent = fileContent;

    return this.prisma.task.update({
      where: { id },
      data,
      include: { subject: true, teacher: { include: { user: true } } },
    });
  }

  async remove(id: number, userId: number) {
    // Check ownership
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.teacher.userId !== userId) {
      throw new ForbiddenException('You can only delete your own tasks');
    }

    // Optionally, check if there are submissions before deleting
    const submissionsCount = await this.prisma.taskSubmission.count({
      where: { taskId: id },
    });
    if (submissionsCount > 0) {
      throw new BadRequestException(
        'Cannot delete task with existing submissions',
      );
    }

    return this.prisma.task.delete({ where: { id } });
  }

  async submit(id: number, submitTaskDto: SubmitTaskDto, userId: number) {
    // Check if user is a student
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        group: {
          select: {
            name: true,
          },
        },
        user: true,
      },
    });
    if (!student) {
      throw new ForbiddenException('Only students can submit tasks');
    }

    // Find the task
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        deadline: true,
        id: true,
        teacher: {
          select: {
            user: true,
          },
        },
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check deadline
    const now = new Date();
    if (now > task.deadline) {
      throw new BadRequestException('Deadline has passed');
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.taskSubmission.findFirst({
      where: { taskId: id, studentId: student.id },
    });
    if (existingSubmission) {
      throw new BadRequestException('You have already submitted this task');
    }

    // Convert base64 to Buffer if provided
    const fileContent = submitTaskDto.fileContent
      ? Buffer.from(submitTaskDto.fileContent, 'base64')
      : null;

    await this.prisma.notification.create({
      data: {
        users: {
          connect: [{ id: task.teacher.user.id }],
        },
        text: `Студент гру ппы ${student.group?.name} ${student.user.fullName} выполнил задания номер ${task.id}`,
        status: 'LOW',
      },
    });

    return this.prisma.taskSubmission.create({
      data: {
        taskId: id,
        studentId: student.id,
        text: submitTaskDto.text ?? '',
        fileContent,
        status: 'PENDING', // From enum
      },
      include: {
        task: {
          include: { subject: true, teacher: { include: { user: true } } },
        },
        student: { include: { user: true } },
      },
    });
  }

  async checkSubmission(
    taskId: number,
    submissionId: number,
    score: number,
    status: TestSubmissionStatus,
    userId: number,
  ) {
    // Check if user is a teacher
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new ForbiddenException('Only teachers can check submissions');
    }

    // Find the task and check ownership
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { teacher: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.teacherId !== teacher.id) {
      throw new ForbiddenException(
        'You can only check submissions for your own tasks',
      );
    }

    // Find the submission
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.taskId !== taskId) {
      throw new BadRequestException('Submission does not belong to this task');
    }

    // Validate score is non-negative (assuming score >= 0)
    if (score < 0) {
      throw new BadRequestException('Score cannot be negative');
    }

    // Update submission
    return this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        score,
        status,
      },
      include: {
        task: {
          include: { subject: true, teacher: { include: { user: true } } },
        },
        student: { include: { user: true } },
      },
    });
  }
}
