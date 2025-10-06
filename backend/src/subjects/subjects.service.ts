import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        teachers: {
          select: {
            teacher: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        lectures: {
          select: {
            id: true,
            title: true,
          },
        },
        tests: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getMySubjects(user: User & { userId: number }) {
    return await this.prisma.subject.findMany({
      where: {
        teachers: {
          some: {
            teacher: {
              user: {
                id: user.userId,
              },
            },
          },
        },
      },
    });
  }

  async getSubjectsWithStudents(user: User & { userId: number }) {
    return this.prisma.subject.findMany({
      where: {
        teachers: {
          some: {
            teacher: {
              user: {
                id: user.userId,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        groups: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
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
            },
          },
        },
      },
    });
  }

  async getTeacherNavbar(user: User & { userId: number }) {
    return await this.prisma.subject.findMany({
      where: {
        teachers: {
          some: {
            teacher: {
              user: {
                id: user.userId,
              },
            },
          },
        },
      },
      include: {
        tests: true,
        lectures: {
          select: {
            id: true,
            title: true,
            description: true,
            uploadDate: true,
          },
        },
      },
    });
  }
}
