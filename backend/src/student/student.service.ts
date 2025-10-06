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
}
