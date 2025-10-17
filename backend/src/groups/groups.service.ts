import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from '../subjects/dto/subjects.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ---------- GROUPS ----------

  async createGroup(dto: CreateGroupDto, user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create groups');
    }

    const existingGroup = await this.prisma.group.findUnique({
      where: { name: dto.name },
    });
    if (existingGroup) {
      throw new BadRequestException(
        `Group with name ${dto.name} already exists`,
      );
    }

    if (dto.subjectIds && dto.subjectIds.length > 0) {
      const subjects = await this.prisma.subject.findMany({
        where: { id: { in: dto.subjectIds } },
      });
      if (subjects.length !== dto.subjectIds.length) {
        throw new BadRequestException('One or more subject IDs are invalid');
      }
    }

    return this.prisma.group.create({
      data: {
        name: dto.name,
        subjects: {
          create: (dto.subjectIds || []).map((subjectId) => ({
            subject: { connect: { id: subjectId } },
          })),
        },
      },
      include: { subjects: { include: { subject: true } } },
    });
  }

  async updateGroup(
    id: number,
    dto: UpdateGroupDto,
    user: User & { role: string },
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update groups');
    }

    const existingGroup = await this.prisma.group.findUnique({ where: { id } });
    if (!existingGroup) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    if (dto.subjectIds && dto.subjectIds.length > 0) {
      const subjects = await this.prisma.subject.findMany({
        where: { id: { in: dto.subjectIds } },
      });
      if (subjects.length !== dto.subjectIds.length) {
        throw new BadRequestException('One or more subject IDs are invalid');
      }
    }

    return this.prisma.group.update({
      where: { id },
      data: {
        name: dto.name,
        subjects: dto.subjectIds
          ? {
              deleteMany: {},
              create: dto.subjectIds.map((subjectId) => ({
                subject: { connect: { id: subjectId } },
              })),
            }
          : undefined,
      },
      include: { subjects: { include: { subject: true } } },
    });
  }

  async deleteGroup(id: number, user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete groups');
    }

    const existingGroup = await this.prisma.group.findUnique({ where: { id } });
    if (!existingGroup) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.prisma.group.delete({ where: { id } });
  }

  async getGroups(user: User & { role: string; userId: number }) {
    if (user.role !== 'admin' && user.role !== 'teacher') {
      throw new ForbiddenException('Only admins and teachers can view groups');
    }

    if (user.role === 'admin') {
      return this.prisma.group.findMany({
        include: { subjects: { include: { subject: true } } },
        orderBy: { name: 'asc' },
      });
    }

    // For teacher: get groups with subjects they teach
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
    });

    if (!teacher) {
      throw new ForbiddenException('Teacher not found');
    }

    const teacherSubjects = await this.prisma.teacherSubject.findMany({
      where: { teacherId: teacher.id },
      select: { subjectId: true },
    });

    const subjectIds = teacherSubjects.map((ts) => ts.subjectId);

    if (subjectIds.length === 0) {
      return []; // No subjects, no groups
    }

    return this.prisma.group.findMany({
      where: {
        subjects: {
          some: {
            subjectId: { in: subjectIds },
          },
        },
      },
      include: { subjects: { include: { subject: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getGroupById(id: number, user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view groups');
    }

    const group = await this.prisma.group.findUnique({
      where: { id },
      include: { subjects: { include: { subject: true } } },
    });

    if (!group) {
      throw new BadRequestException(`Group with ID ${id} not found`);
    }

    return group;
  }
}
