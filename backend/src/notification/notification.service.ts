import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotification(
    user: User & { role: string; userId: number },
    filters?: {
      status?: string;
      text?: string;
      id?: number;
      userId?: number;
      userType?: 'teacher' | 'admin' | 'student' | 'all';
      sortBy?: string;
      order?: 'asc' | 'desc';
      dateFrom?: Date;
      dateTo?: Date;
    },
  ) {
    const where: any = {};

    if (filters?.id) where.id = Number(filters.id);
    if (filters?.status) where.status = filters.status;
    if (filters?.text)
      where.text = { contains: filters.text, mode: 'insensitive' };
    if (filters?.userId) where.users = { some: { id: Number(filters.userId) } };

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters?.userType && filters.userType !== 'all') {
      where.users = {
        some: {
          [filters.userType]: {
            isNot: null,
          },
        },
      };
    }

    const validSortFields = ['id', 'status', 'text', 'createdAt'] as const;
    const sortField = validSortFields.includes(filters?.sortBy as any)
      ? (filters!.sortBy as (typeof validSortFields)[number])
      : 'createdAt';

    const sortOrder: 'asc' | 'desc' = filters?.order ?? 'desc';

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortField]: sortOrder,
    };

    if (user.role === 'admin') {
      return this.prisma.notification.findMany({
        where,
        select: {
          id: true,
          status: true,
          text: true,
          users: {
            select: {
              id: true,
              fullName: true,
              student: true,
              login: true,
              admin: true,
              teacher: true,
            },
          },
          createdAt: true,
        },
        orderBy: orderBy as any,
      });
    }

    return this.prisma.notification.findMany({
      where: {
        ...where,
        users: { some: { id: user.userId } },
      },
      select: {
        id: true,
        status: true,
        text: true,
        users: {
          select: {
            id: true,
            fullName: true,
            student: true,
            login: true,
            admin: true,
            teacher: true,
          },
        },
        createdAt: true,
      },
      orderBy: orderBy as any,
    });
  }

  async createNotification(
    dto: CreateNotificationDto,
    user: User & { role: string },
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create notifications');
    }

    if (dto.userIds && dto.userIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: dto.userIds } },
      });
      if (users.length !== dto.userIds.length) {
        throw new BadRequestException('One or more user IDs are invalid');
      }
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: dto.userIds,
        },
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    return this.prisma.notification.create({
      data: {
        text: dto.text,
        status: dto.status,
        users: { connect: users },
      },
      include: { users: true },
    });
  }

  async updateNotification(
    id: number,
    dto: UpdateNotificationDto,
    user: User & { role: string },
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update notifications');
    }

    const existingNotification = await this.prisma.notification.findUnique({
      where: { id: Number(id) },
      include: { users: true },
    });

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    let userConnectData;

    if (dto.userIds && dto.userIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: dto.userIds } },
      });

      if (users.length !== dto.userIds.length) {
        throw new BadRequestException('One or more user IDs are invalid');
      }

      userConnectData = {
        set: users.map((u) => ({ id: u.id })),
      };
    }

    return this.prisma.notification.update({
      where: { id: Number(id) },
      data: {
        text: dto.text ?? existingNotification.text,
        status: dto.status ?? existingNotification.status,
        ...(userConnectData ? { users: userConnectData } : {}),
      },
      include: { users: true },
    });
  }

  async deleteNotification(id: number, user: User & { role: string }) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete notifications');
    }

    const notification = await this.prisma.notification.findUnique({
      where: { id: Number(id) },
      include: { users: true },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Отвязываем пользователей перед удалением (важно для M:N)
    await this.prisma.notification.update({
      where: { id: Number(id) },
      data: { users: { set: [] } },
    });

    return this.prisma.notification.delete({ where: { id: Number(id) } });
  }
}
