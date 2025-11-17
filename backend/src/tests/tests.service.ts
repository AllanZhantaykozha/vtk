import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTestDto, SubmitTestDto, UpdateTestDto } from './dto/tests.dto';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async createTest(
    dto: CreateTestDto,
    user: User & { role: string; userId: number },
    files?: Express.Multer.File[],
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    if (typeof dto.questions === 'string') {
      dto.questions = JSON.parse(dto.questions);
    }

    let teacherId: number;
    if (user.role === 'teacher') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.userId },
        include: { subjects: { include: { subject: true } } },
      });
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }
      teacherId = teacher.id;
      const subject = await this.prisma.subject.findUnique({
        where: { id: Number(dto.subjectId) },
      });
      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${dto.subjectId} does not exist`,
        );
      }

      if (
        !teacher.subjects.some((ts) => ts.subjectId === Number(dto.subjectId))
      ) {
        throw new ForbiddenException(
          'Teacher is not authorized for this subject',
        );
      }
    } else if (user.role === 'admin') {
      const teacher = await this.prisma.teacher.findFirst();
      if (!teacher) {
        throw new BadRequestException(
          'No teachers available to assign the test',
        );
      }
      teacherId = teacher.id;
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${dto.subjectId} does not exist`,
        );
      }
    } else {
      throw new ForbiddenException('Only teachers and admins can create tests');
    }

    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('At least one question is required');
    }
    for (const question of dto.questions) {
      if (!question.options || question.options.length === 0) {
        throw new BadRequestException(
          'Each question must have at least one option',
        );
      }
      if (!question.correct || question.correct.length === 0) {
        throw new BadRequestException(
          'Each question must have at least one correct answer',
        );
      }
      for (const correctIndex of question.correct) {
        if (correctIndex < 0 || correctIndex > question.options.length) {
          throw new BadRequestException(
            `Correct answer index ${correctIndex} is invalid`,
          );
        }
      }
    }

    // Валидация deadline
    if (dto.deadline) {
      const deadlineDate = new Date(dto.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new BadRequestException('Invalid deadline format');
      }
      if (deadlineDate <= new Date()) {
        throw new BadRequestException('Deadline must be in the future');
      }
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: Number(dto.subjectId) },
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

    // Уведомления создаются циклом, т.к. createMany не поддерживает connect
    for (const id of userIds) {
      await this.prisma.notification.create({
        data: {
          users: { connect: { id } },
          text: `По уроку ${subject.name} появился новый тест`,
          status: 'LOW',
        },
      });
    }

    const imagesMap: Record<string, string> = {};
    if (files && files.length > 0) {
      for (const file of files) {
        const key = file.fieldname;
        imagesMap[key] = `/uploads/questions/${file.filename}`;
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const test = await prisma.test.create({
        data: {
          title: dto.title,
          description: dto.description || '',
          subjectId: Number(dto.subjectId),
          teacherId,
          deadline: new Date(dto.deadline),
        },
      });

      for (let i = 0; i < dto.questions.length; i++) {
        const questionDto = dto.questions[i];
        const imagePath = files?.[i]
          ? `/uploads/questions/${files[i].filename}`
          : null;
        console.log(questionDto);
        console.log(imagePath);
        console.log(imagesMap);
        const question = await prisma.question.create({
          data: {
            testId: test.id,
            text: questionDto.text,
            image: imagePath,
            type: questionDto.type,
            correct: questionDto.correct,
          },
        });

        await prisma.option.createMany({
          data: questionDto.options.map((option) => ({
            questionId: question.id,
            text: option.text,
          })),
        });
      }

      return prisma.test.findUnique({
        where: { id: test.id },
        include: {
          questions: { include: { options: true } },
          subject: true,
        },
      });
    });
  }

  async getTests(
    user: User & { role: string; userId: number },
    filters: {
      subject?: string;
      title?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const baseWhere: Prisma.TestWhereInput = {};

    const subjectId = filters.subject ? Number(filters.subject) : null;
    if (subjectId) {
      baseWhere.subjectId = subjectId;
    }

    if (filters.title && filters.title.trim() !== '') {
      baseWhere.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      baseWhere.uploadDate = {};
      if (filters.startDate) {
        baseWhere.uploadDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        baseWhere.uploadDate.lte = new Date(filters.endDate);
      }
    }

    let where: Prisma.TestWhereInput = {};

    let studentId: number | undefined;

    if (user.role === 'teacher') {
      where = {
        ...baseWhere,
        teacher: { userId: user.userId },
      };
    } else if (user.role === 'student') {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student) {
        throw new ForbiddenException('Student not found');
      }
      studentId = student.id;
      where = {
        ...baseWhere,
        subject: {
          groups: {
            some: {
              group: {
                students: {
                  some: {
                    userId: user.userId,
                  },
                },
              },
            },
          },
        },
      };
    } else if (user.role === 'admin') {
      where = {
        ...baseWhere,
      };
    }

    const include: Prisma.TestInclude = {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              login: true,
            },
          },
        },
      },
      subject: true,
      questions: true,
    };

    if (user.role === 'student') {
      include.submissions = {
        where: { studentId },
        select: {
          id: true,
          testId: true,
          student: true,
          studentId: true,
          answers: true,
          score: true,
          submittedAt: true,
          status: true,
        },
      };
    } else {
      include.submissions = {
        select: {
          id: true,
          testId: true,
          student: true,
          studentId: true,
          answers: true,
          score: true,
          submittedAt: true,
          status: true,
        },
      };
    }

    const tests = await this.prisma.test.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include,
      orderBy: { uploadDate: 'desc' },
    });

    // Добавляем информацию о deadline
    const now = new Date();
    return tests.map((test) => {
      const isExpired = test.deadline ? test.deadline < now : false;
      const timeRemaining = test.deadline
        ? Math.max(0, test.deadline.getTime() - now.getTime())
        : null;

      return {
        ...test,
        isExpired,
        timeRemaining,
      };
    });
  }

  async getTestById(id: number, user: User & { role: string; userId: number }) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        questions: { include: { options: true } },
        subject: true,
        submissions: true,
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
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
      if (!student.group.subjects.some((s) => s.subjectId === test.subjectId)) {
        throw new ForbiddenException('You do not have access to this test');
      }

      // Проверка на предыдущую сдачу теста
      const studentSubmissions = test.submissions.filter(
        (submission) => submission.studentId === student.id,
      );
      if (
        studentSubmissions.some((submission) =>
          ['PENDING', 'APPROVED'].includes(submission.status),
        )
      ) {
        return {
          status: studentSubmissions.map((obj) => obj.status)[0],
        };
      }
      // Если статус rejected или нет submissions, продолжаем отдавать тест
    }

    const now = new Date();
    const isExpired = test.deadline ? test.deadline < now : false;
    const timeRemaining = test.deadline
      ? Math.max(0, test.deadline.getTime() - now.getTime())
      : null;

    return {
      ...test,
      uploadDate: test.uploadDate.toISOString(),
      deadline: test.deadline?.toISOString() || null,
      isExpired,
      timeRemaining,
    };
  }

  async updateTest(
    id: number,
    dto: UpdateTestDto,
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const test = await this.prisma.test.findUnique({
      where: { id: Number(id) },
      include: { teacher: true, subject: true },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
      include: { subjects: true },
    });

    if (user.role === 'teacher') {
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }
      if (test.teacherId !== teacher.id) {
        throw new ForbiddenException('Only the test creator can update it');
      }
      if (
        dto.subjectId &&
        !teacher.subjects.some((ts) => ts.subjectId === dto.subjectId)
      ) {
        throw new ForbiddenException(
          'Teacher is not authorized for this subject',
        );
      }
    } else if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only teachers who created the test or admins can update tests',
      );
    }

    if (dto.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${dto.subjectId} does not exist`,
        );
      }
    }

    // Валидация deadline при обновлении
    if (dto.deadline) {
      const deadlineDate = new Date(dto.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new BadRequestException('Invalid deadline format');
      }
      if (deadlineDate <= new Date()) {
        throw new BadRequestException('Deadline must be in the future');
      }
    }

    if (dto.questions && dto.questions.length > 0) {
      for (const question of dto.questions) {
        if (!question.options || question.options.length === 0) {
          throw new BadRequestException(
            'Each question must have at least one option',
          );
        }
        if (!question.correct || question.correct.length === 0) {
          throw new BadRequestException(
            'Each question must have at least one correct answer',
          );
        }
        for (const correctIndex of question.correct) {
          if (correctIndex < 0 || correctIndex >= question.options.length) {
            throw new BadRequestException(
              `Correct answer index ${correctIndex} is invalid`,
            );
          }
        }
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update test
      await prisma.test.update({
        where: { id: Number(id) },
        data: {
          title: dto.title,
          description: dto.description,
          deadline: dto.deadline ? new Date(dto.deadline) : undefined,
          subject: dto.subjectId
            ? { connect: { id: dto.subjectId } }
            : undefined,
        },
      });

      // If questions are provided, delete existing questions and options
      if (dto.questions && dto.questions.length > 0) {
        await prisma.question.deleteMany({ where: { testId: Number(id) } });

        // Create new questions and options
        for (const questionDto of dto.questions) {
          const question = await prisma.question.create({
            data: {
              testId: Number(id),
              text: questionDto.text,
              image: questionDto.image,
              type: questionDto.type,
              correct: questionDto.correct,
            },
          });

          await prisma.option.createMany({
            data: questionDto.options.map((option) => ({
              questionId: question.id,
              text: option.text,
            })),
          });
        }
      }

      return prisma.test.findUnique({
        where: { id: Number(id) },
        include: {
          questions: { include: { options: true } },
          subject: true,
          teacher: { include: { user: true } },
        },
      });
    });
  }

  async deleteTest(id: number, user: User & { role: string; userId: number }) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const test = await this.prisma.test.findUnique({
      where: { id: Number(id) },
      include: { teacher: true },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
    });

    if (user.role === 'teacher') {
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }
      if (test.teacherId !== teacher.id) {
        throw new ForbiddenException('Only the test creator can delete it');
      }
    } else if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only teachers who created the test or admins can delete tests',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.testSubmission.deleteMany({ where: { testId: Number(id) } });
      await prisma.question.deleteMany({ where: { testId: Number(id) } });
      return prisma.test.delete({ where: { id: Number(id) } });
    });
  }

  async submitTest(
    id: number,
    dto: SubmitTestDto,
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    if (user.role !== 'student') {
      throw new ForbiddenException('Only students can submit tests');
    }

    const student = await this.prisma.student.findUnique({
      where: { userId: user.userId },
      include: {
        user: { select: { fullName: true } },
        group: { include: { subjects: { include: { subject: true } } } },
      },
    });
    if (!student || !student.group) {
      throw new ForbiddenException(
        'User is not a registered student or group is missing',
      );
    }

    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: { include: { options: true } },
        subject: true,
        teacher: {
          select: { user: true },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    // Проверка deadline
    if (test.deadline) {
      const now = new Date();
      if (test.deadline < now) {
        const timeExpired = now.getTime() - test.deadline.getTime();
        throw new ForbiddenException(
          `Deadline для этого теста истёк. Тест был просрочен ${this.formatTimeAgo(timeExpired)} назад.`,
        );
      }
    }

    if (!student.group.subjects.some((s) => s.subjectId === test.subjectId)) {
      throw new ForbiddenException('You do not have access to this test');
    }

    // Check for existing submission
    const existingSubmission = await this.prisma.testSubmission.findMany({
      where: { testId: id, studentId: student.id },
      orderBy: { submittedAt: 'asc' },
    });

    if (existingSubmission[0]) {
      if (existingSubmission[0].status === 'APPROVED') {
        throw new ForbiddenException(
          'Test already passed successfully. No resubmission allowed.',
        );
      }
      if (existingSubmission[0].status === 'PENDING') {
        throw new BadRequestException(
          'Test already submitted and pending review. Cannot resubmit yet.',
        );
      }
      // If REJECTED, allow new submission
    }

    const answers = dto.answers;
    let score = 0;
    for (const question of test.questions) {
      const submittedAnswer = answers[question.id];
      if (!submittedAnswer || !Array.isArray(submittedAnswer)) {
        throw new BadRequestException(
          `Answers for question ${question.id} are missing or invalid`,
        );
      }

      const isCorrect =
        submittedAnswer.sort().join(',') === question.correct.sort().join(',');
      if (isCorrect) {
        score += 1;
      }
    }

    const grade = Math.round((score / test.questions.length) * 100);

    await this.prisma.notification.create({
      data: {
        users: {
          connect: [{ id: test.teacher.user.id }],
        },
        text: `Студент группы ${student.group.name} ${student.user.fullName} прошел тест номер ${test.id} на ${grade}%`,
        status: 'LOW',
      },
    });

    return this.prisma.testSubmission.create({
      data: {
        testId: id,
        studentId: student.id,
        answers: answers as any,
        score,
      },
    });
  }

  // Вспомогательная функция для форматирования времени
  private formatTimeAgo(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`;
    }
    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'}`;
    }
    return `${seconds} ${seconds === 1 ? 'секунду' : seconds < 5 ? 'секунды' : 'секунд'}`;
  }

  async updateSubmissionStatus(
    submissionId: number,
    status: 'APPROVED' | 'REJECTED',
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      throw new ForbiddenException(
        'Only teachers or admins can update submission status',
      );
    }

    const submission = await this.prisma.testSubmission.findUnique({
      where: { id: submissionId },
      include: { test: true },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    // Проверка: если teacher, то он может менять только те тесты, которые сам создал
    if (user.role === 'teacher') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.userId },
      });
      if (!teacher || submission.test.teacherId !== teacher.id) {
        throw new ForbiddenException(
          'You are not authorized to update this submission',
        );
      }
    }

    if (submission.status === 'APPROVED') {
      throw new BadRequestException(
        'This submission has already been approved',
      );
    }

    const updated = await this.prisma.testSubmission.update({
      where: { id: submissionId },
      data: { status },
    });

    const userIdToNotification = await this.prisma.student.findUnique({
      where: {
        id: submission.studentId,
      },
      select: {
        userId: true,
      },
    });

    if (!userIdToNotification?.userId) {
      throw new BadRequestException('user is not exist');
    }

    await this.prisma.notification.create({
      data: {
        users: {
          connect: [{ id: userIdToNotification.userId }],
        },
        text: `Результат теста №${submission.id}: ${status === 'APPROVED' ? 'Одобрен' : 'Отклонён'}`,
        status: 'MEDIUM',
      },
    });

    return {
      message: `Submission ${submissionId} status updated to ${status}`,
      submission: updated,
    };
  }

  async getStatistic(
    user: User & { role: string; userId: number },
    groupId?: number,
  ) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // если студент — игнорируем groupId и берём только его тесты
    if (user.role === 'student') {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.userId },
        include: { group: true },
      });

      if (!student) {
        throw new ForbiddenException('User is not a registered student');
      }

      // собираем статистику по его попыткам за неделю
      const submissions = await this.prisma.testSubmission.findMany({
        where: {
          studentId: student.id,
          test: { uploadDate: { gte: weekAgo } },
        },
        include: {
          test: {
            include: {
              subject: true,
              questions: { select: { id: true } },
            },
          },
        },
      });

      interface SubjectStat {
        subjectName: string;
        totalTests: number;
        totalSubmissions: number;
        totalGrade: number;
      }

      const subjectStats = new Map<number, SubjectStat>();

      for (const sub of submissions) {
        const subjectId = sub.test.subject.id;
        const existing = subjectStats.get(subjectId) || {
          subjectName: sub.test.subject.name,
          totalTests: 0,
          totalSubmissions: 0,
          totalGrade: 0,
        };

        const numQuestions = sub.test.questions.length;
        const grade = numQuestions > 0 ? (sub.score / numQuestions) * 100 : 0;

        existing.totalTests += 1;
        existing.totalSubmissions += 1;
        existing.totalGrade += grade;

        subjectStats.set(subjectId, existing);
      }

      // преобразуем в массив и считаем средний балл
      return Array.from(subjectStats.values()).map((stat) => ({
        groupName: student.group?.name ?? '—',
        subjectName: stat.subjectName,
        totalTests: stat.totalTests,
        totalSubmissions: stat.totalSubmissions,
        averageGrade:
          stat.totalSubmissions > 0
            ? Math.round(stat.totalGrade / stat.totalSubmissions)
            : 0,
      }));
    }

    // остальная логика — для преподавателей и админов
    const groupSubjects = await this.prisma.groupSubject.findMany({
      include: {
        group: true,
        subject: true,
      },
    });

    let filteredGroupSubjects = groupSubjects;
    if (user.role === 'teacher') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.userId },
        include: { subjects: true },
      });
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }
      const teacherSubjectIds = teacher.subjects.map((ts) => ts.subjectId);
      filteredGroupSubjects = groupSubjects.filter((gs) =>
        teacherSubjectIds.includes(gs.subjectId),
      );
    }

    if (groupId !== undefined) {
      filteredGroupSubjects = filteredGroupSubjects.filter(
        (gs) => gs.group.id === groupId,
      );
    }

    const stats = await Promise.all(
      filteredGroupSubjects.map(async (gs) => {
        const { group, subject } = gs;

        const totalTests = await this.prisma.test.count({
          where: {
            subjectId: subject.id,
            uploadDate: { gte: weekAgo },
          },
        });

        const totalSubmissions = await this.prisma.testSubmission.count({
          where: {
            student: {
              groupId: group.id,
            },
            test: {
              subjectId: subject.id,
              uploadDate: { gte: weekAgo },
            },
          },
        });

        const submissions = await this.prisma.testSubmission.findMany({
          where: {
            student: { groupId: group.id },
            test: {
              subjectId: subject.id,
              uploadDate: { gte: weekAgo },
            },
          },
          include: {
            test: {
              select: { questions: { select: { id: true } } },
            },
          },
        });

        let totalGrade = 0;
        let subCount = 0;
        for (const sub of submissions) {
          const numQuestions = sub.test.questions.length;
          if (numQuestions > 0) {
            const grade = (sub.score / numQuestions) * 100;
            totalGrade += grade;
            subCount++;
          }
        }

        const averageGrade =
          subCount > 0 ? Math.round(totalGrade / subCount) : 0;

        return {
          groupName: group.name,
          subjectName: subject.name,
          totalTests,
          totalSubmissions,
          averageGrade,
        };
      }),
    );

    return stats.filter((s) => s.totalTests > 0);
  }
}
