import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getMySubjects(user: User & { userId: number }) {
    return await this.prisma.student.findMany({
      where: {
        userId: user.userId,
      },
      select: {
        group: {
          select: {
            subjects: {
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    tests: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                    lectures: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getAllStudents(filters?: {
    id?: number;
    login?: string;
    fullName?: string;
    groupId?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const where: any = {};

    if (filters?.groupId) where.group = { id: Number(filters.groupId) };
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

    return await this.prisma.student.findMany({
      where,
      select: {
        id: true,
        group: {
          select: {
            name: true,
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
}
