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
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
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
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${dto.subjectId} does not exist`,
        );
      }
      if (!teacher.subjects.some((ts) => ts.subjectId === dto.subjectId)) {
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
        if (correctIndex < 0 || correctIndex >= question.options.length) {
          throw new BadRequestException(
            `Correct answer index ${correctIndex} is invalid`,
          );
        }
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const test = await prisma.test.create({
        data: {
          title: dto.title,
          description: dto.description || '',
          subjectId: dto.subjectId,
          teacherId,
        },
      });

      for (const questionDto of dto.questions) {
        const question = await prisma.question.create({
          data: {
            testId: test.id,
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

    const where: Prisma.TestWhereInput = {};

    const subjectId = filters.subject ? Number(filters.subject) : null;
    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (filters.title && filters.title.trim() !== '') {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.uploadDate = {};
      if (filters.startDate) {
        where.uploadDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.uploadDate.lte = new Date(filters.endDate);
      }
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

      where.subjectId = { in: student.group.subjects.map((s) => s.subjectId) };
    } else if (user.role !== 'teacher' && user.role !== 'admin') {
      throw new ForbiddenException('Unauthorized access');
    }

    return this.prisma.test.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
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
        submissions: true,
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  async getMyTests(
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

    const where: Prisma.TestWhereInput = {};

    const subjectId = filters.subject ? Number(filters.subject) : null;
    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (filters.title && filters.title.trim() !== '') {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.uploadDate = {};
      if (filters.startDate) {
        where.uploadDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.uploadDate.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.test.findMany({
      where: {
        ...(Object.keys(where).length > 0 ? where : undefined),
        teacher: { userId: user.userId },
      },
      include: {
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
        submissions: true,
      },
      orderBy: { uploadDate: 'desc' },
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
    }

    return {
      ...test,
      uploadDate: test.uploadDate.toISOString(),
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
      const updatedTest = await prisma.test.update({
        where: { id: Number(id) },
        data: {
          title: dto.title,
          description: dto.description,
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
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    if (!student.group.subjects.some((s) => s.subjectId === test.subjectId)) {
      throw new ForbiddenException('You do not have access to this test');
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

    return this.prisma.testSubmission.create({
      data: {
        testId: id,
        studentId: student.id,
        answers: answers as any,
        score,
      },
    });
  }
}
