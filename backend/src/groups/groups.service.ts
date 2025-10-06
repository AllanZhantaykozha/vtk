import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subjects.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ---------- SUBJECTS ----------

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

    return this.prisma.subject.delete({ where: { id } });
  }

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

  async getGroups(user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view groups');
    }

    return this.prisma.group.findMany({
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
