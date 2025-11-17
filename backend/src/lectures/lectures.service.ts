import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateLectureDto, UpdateLectureDto } from './dto/lectures.dto';

@Injectable()
export class LecturesService {
  constructor(private prisma: PrismaService) {}

  async createLecture(
    dto: CreateLectureDto,
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }
    let teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
      include: { subjects: true },
    });

    if (!teacher) throw new BadRequestException('Teacher does not exist');

    if (user.role === 'teacher') {
      teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.userId },
        include: { subjects: { include: { subject: true } } },
      });
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }

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
      if (!teacher.id) {
        throw new BadRequestException('Admins must specify a teacher.id');
      }
      teacher = await this.prisma.teacher.findUnique({
        where: { id: teacher.id },
        include: { subjects: { include: { subject: true } } },
      });
      if (!teacher) {
        throw new BadRequestException('Invalid teacher.id');
      }
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
      });
      if (!subject) {
        throw new BadRequestException(
          `Subject with ID ${dto.subjectId} does not exist`,
        );
      }
    } else {
      throw new ForbiddenException(
        'Only teachers and admins can create lectures',
      );
    }

    try {
      const fileContent = Buffer.from(dto.fileContent, 'base64');

      return await this.prisma.lecture.create({
        data: {
          title: dto.title,
          subjectId: dto.subjectId,
          teacherId: teacher.id,
          description: dto.description,
          fileContent,
        },
        include: { subject: true },
      });
    } catch (error) {
      throw new BadRequestException('Invalid base64 file content');
    }
  }

  async getLectures(
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

    const subjectId = Number(filters.subject);

    const where: Prisma.LectureWhereInput = {};

    // Фильтры по названию, датам и предмету
    if (filters.title) {
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
    if (subjectId) {
      where.subjectId = subjectId;
    }

    // === Роли и ограничения доступа ===
    if (user.role === 'student') {
      // Студент: только предметы из его группы
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
    } else if (user.role === 'teacher') {
      // Преподаватель: ТОЛЬКО СВОИ лекции
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.userId },
      });
      if (!teacher) {
        throw new ForbiddenException('Teacher profile not found');
      }
      where.teacherId = teacher.id; // Ключевое ограничение
    } else if (user.role !== 'admin') {
      throw new ForbiddenException('Unauthorized access');
    }

    // === Запрос ===
    return this.prisma.lecture.findMany({
      where,
      select: {
        id: true,
        title: true,
        uploadDate: true,
        description: true,
        subject: true,
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                login: true,
              },
            },
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  async getLectureById(
    id: number,
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        uploadDate: true,
        description: true,
        fileContent: true,
        subject: true,
        teacher: {
          select: {
            id: true,
            user: true,
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${id} not found`);
    }

    return lecture;
  }

  async updateLecture(
    id: number,
    dto: UpdateLectureDto,
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: { teacher: true, subject: true },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${id} not found`);
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
      include: { subjects: true },
    });

    if (user.role === 'teacher') {
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }
      if (lecture.teacherId !== teacher.id) {
        throw new ForbiddenException('Only the lecture creator can update it');
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
        'Only teachers who created the lecture or admins can update lectures',
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

    const updateData: Prisma.LectureUpdateInput = {
      title: dto.title,
      description: dto.description,
      subject: dto.subjectId ? { connect: { id: dto.subjectId } } : undefined,
    };

    if (dto.fileContent) {
      try {
        updateData.fileContent = Buffer.from(dto.fileContent, 'base64');
      } catch (error) {
        throw new BadRequestException('Invalid base64 file content');
      }
    }

    return this.prisma.lecture.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        teacher: { select: { id: true, user: true } },
      },
    });
  }

  async deleteLecture(
    id: number,
    user: User & { role: string; userId: number },
  ) {
    if (!user.userId) {
      throw new BadRequestException('User ID is missing');
    }

    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${id} not found`);
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: user.userId },
    });

    if (user.role === 'teacher') {
      if (!teacher) {
        throw new ForbiddenException('User is not a registered teacher');
      }
      if (lecture.teacherId !== teacher.id) {
        throw new ForbiddenException('Only the lecture creator can delete it');
      }
    } else if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only teachers who created the lecture or admins can delete lectures',
      );
    }

    return this.prisma.lecture.delete({
      where: { id },
    });
  }
}
