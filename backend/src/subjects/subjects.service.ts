import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async getAll(
    user: User & { role: string; userId: number },
    filters: {
      title?: string;
      teacherId?: string;
    },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const baseWhere: Prisma.SubjectWhereInput = {};

    const teacherId = filters.teacherId ? Number(filters.teacherId) : null;
    if (teacherId) {
      baseWhere.teachers = {
        some: {
          teacherId,
        },
      };
    }

    if (filters.title && filters.title.trim() !== '') {
      baseWhere.name = { contains: filters.title, mode: 'insensitive' };
    }

    let where: Prisma.SubjectWhereInput = baseWhere;

    if (user.role === 'teacher') {
      where = {
        ...where,
        teachers: {
          some: {
            teacher: {
              userId: user.userId,
            },
          },
        },
      };
    } else if (user.role === 'student') {
      where = {
        ...where,
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
      };
    } else if (user.role === 'admin') {
      where = {
        ...where,
      };
    }

    return this.prisma.subject.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      select: {
        id: true,
        name: true,
        teachers: {
          select: {
            teacher: {
              select: {
                userId: true,
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
        groups: {
          select: {
            group: true,
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

  async createSubject(dto: CreateSubjectDto, user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create subjects');
    }

    const existingSubject = await this.prisma.subject.findUnique({
      where: { name: dto.name },
    });
    if (existingSubject) {
      throw new BadRequestException(
        `Subject with name ${dto.name} already exists`,
      );
    }

    return this.prisma.subject.create({
      data: { name: dto.name },
    });
  }

  async updateSubject(
    id: number,
    dto: UpdateSubjectDto,
    user: User & { role: string },
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update subjects');
    }

    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return this.prisma.subject.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async deleteSubject(id: number, user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete subjects');
    }

    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    console.log(id, user);

    return this.prisma.subject.delete({ where: { id } });
  }
}
