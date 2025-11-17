import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './dto/notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getNotification(
    @Request() req,
    @Query('status') status?: string,
    @Query('id') id?: number,
    @Query('text') text?: string,
    @Query('userId') userId?: number,
    @Query('userType') userType?: 'teacher' | 'admin' | 'student' | 'all',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.notificationService.getNotification(req.user, {
      status,
      text,
      id: id ? Number(id) : undefined,
      userId: userId ? Number(userId) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      userType,
      sortBy,
      order,
    });
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateNotificationDto, @Request() req) {
    return await this.notificationService.createNotification(dto, req.user);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateNotificationDto,
    @Request() req,
  ) {
    return await this.notificationService.updateNotification(id, dto, req.user);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: number, @Request() req) {
    return await this.notificationService.deleteNotification(id, req.user);
  }
}
