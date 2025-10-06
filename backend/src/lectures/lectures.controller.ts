import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { CreateLectureDto, UpdateLectureDto } from './dto/lectures.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lectures')
export class LecturesController {
  constructor(private lecturesService: LecturesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async create(@Body() createLectureDto: CreateLectureDto, @Request() req) {
    return this.lecturesService.createLecture(createLectureDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher', 'admin')
  async getLectures(
    @Request() req,
    @Query('subject') subject?: string,
    @Query('title') title?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lecturesService.getLectures(req.user, {
      subject,
      title,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher', 'admin')
  async getLectureById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.lecturesService.getLectureById(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async updateLecture(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLectureDto: UpdateLectureDto,
    @Request() req,
  ) {
    return this.lecturesService.updateLecture(id, updateLectureDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async deleteLecture(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.lecturesService.deleteLecture(id, req.user);
  }
}
