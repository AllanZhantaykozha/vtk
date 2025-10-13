import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotification(user: User & { userId: number }) {
    const res = await this.prisma.notification.findMany({
      where: {
        userId: user.userId,
      },
    });

    return res;
  }
}
