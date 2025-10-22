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

  async getNotification(user: User & { role: string }) {
    if (user.role === 'admin') {
      return await this.prisma.notification.findMany({
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
      });
    }
    return this.prisma.notification.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        users: true,
      },
      orderBy: { createdAt: 'desc' },
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
