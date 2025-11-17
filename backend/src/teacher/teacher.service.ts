import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async getAllTeachers(filters?: {
    id?: number;
    login?: string;
    fullName?: string;
    subjectsId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const where: any = {};

    if (filters?.id) where.user = { id: Number(filters.id) };
    if (filters?.login)
      where.user = {
        ...where.user,
        login: { contains: filters.login, mode: 'insensitive' },
      };
    if (filters?.fullName)
      where.user = {
        ...where.user,
        fullName: { contains: filters.fullName, mode: 'insensitive' },
      };

    if (filters?.subjectsId && filters?.subjectsId.length > 0) {
      const subjectsId = filters?.subjectsId?.split(',').map(Number);

      where.subjects = {
        some: {
          subjectId: { in: subjectsId },
        },
      };
    }

    const validSortFields = ['id', 'fullName', 'login'] as const;
    const sortField = validSortFields.includes(filters?.sortBy as any)
      ? (filters!.sortBy as (typeof validSortFields)[number])
      : 'id';

    const sortOrder: 'asc' | 'desc' = filters?.order ?? 'desc';

    // сортировка по вложенным полям
    const orderBy =
      sortField === 'fullName' || sortField === 'login'
        ? { user: { [sortField]: sortOrder } }
        : { [sortField]: sortOrder };

    return await this.prisma.teacher.findMany({
      where,
      select: {
        id: true,
        subjects: {
          select: {
            subject: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            login: true,
          },
        },
      },
      orderBy,
    });
  }

  async getMyTests(
    user: User & { userId: number },
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

    // subject
    const subjectId = filters.subject ? Number(filters.subject) : null;
    if (subjectId) {
      where.subjectId = subjectId;
    }

    // title
    if (filters.title && filters.title.trim() !== '') {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    // dates
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
        ...(Object.keys(where).length > 0 ? where : {}),
        teacher: {
          user: {
            id: user.userId,
          },
        },
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

  async getMyTest(user: User & { userId: number }, id: number) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    return this.prisma.test.findUnique({
      where: {
        id,
        teacher: {
          user: {
            id: user.userId,
          },
        },
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
        questions: {
          select: {
            id: true,
            testId: true,
            test: true,
            type: true,
            options: true,
            correct: true,
            text: true,
          },
        },
      },
    });
  }

  async getMyLectures(
    user: User & { userId: number },
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

    const where: Prisma.LectureWhereInput = {};

    // subject
    const subjectId = filters.subject ? Number(filters.subject) : null;
    if (subjectId) {
      where.subjectId = subjectId;
    }

    // title
    if (filters.title && filters.title.trim() !== '') {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    // dates
    if (filters.startDate || filters.endDate) {
      where.uploadDate = {};
      if (filters.startDate) {
        where.uploadDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.uploadDate.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.lecture.findMany({
      where: {
        ...(Object.keys(where).length > 0 ? where : {}),
        teacher: {
          user: {
            id: user.userId,
          },
        },
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
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  async getMySubjects(user: User & { userId: number }) {
    return await this.prisma.subject.findMany({
      where: {
        teachers: {
          some: {
            teacher: {
              userId: user.userId,
            },
          },
        },
      },
    });
  }

  async getStudents(user: User & { userId: number }) {
    // 1) Список subjectId, которые ведёт текущий преподаватель
    const teacherSubjects = await this.prisma.subject.findMany({
      where: {
        teachers: {
          some: {
            teacher: {
              userId: user.userId,
            },
          },
        },
      },
      select: { id: true },
    });

    const teacherSubjectIds = teacherSubjects.map((s) => s.id);
    if (teacherSubjectIds.length === 0) return []; // преподаватель не ведёт предметов

    // 2) Берём группы, у которых есть хотя бы один subject из teacherSubjectIds
    const groups = await this.prisma.group.findMany({
      where: {
        subjects: {
          some: {
            subjectId: { in: teacherSubjectIds },
          },
        },
      },
      select: {
        id: true,
        name: true,
        // подтягиваем все subject-связи (мы потом отфильтруем на уровне JS)
        subjects: {
          select: {
            subjectId: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    // 3) Оставляем в каждой группе только те subject, которые ведёт преподаватель
    const filtered = groups
      .map((g) => {
        const subjectsFiltered = g.subjects
          .filter((s) => teacherSubjectIds.includes(s.subjectId))
          .map((s) => ({
            subjectId: s.subjectId,
            subject: { id: s.subject.id, name: s.subject.name },
          }));

        return {
          id: g.id,
          name: g.name,
          subjects: subjectsFiltered,
          students: g.students,
        };
      })
      // лишняя защита: отбрасываем группы, у которых после фильтрации нет предметов
      .filter((g) => g.subjects.length > 0);

    return filtered;
  }

  async getPassedTests(user: User & { userId: number }) {
    return await this.prisma.testSubmission.findMany({
      where: {
        test: {
          teacher: {
            userId: user.userId, // только тесты текущего преподавателя
          },
        },
      },
      select: {
        id: true,
        score: true,
        status: true,
        submittedAt: true,
        student: {
          select: {
            id: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        test: {
          select: {
            id: true,
            title: true,

            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            questions: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }
}
