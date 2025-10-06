import {
  Request,
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/lectures')
  getMyLectures(
    @Request() req,
    @Query('subject') subject?: string,
    @Query('title') title?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.teacherService.getMyLectures(req.user, {
      subject,
      title,
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/tests')
  getMyTests(
    @Request() req,
    @Query('subject') subject?: string,
    @Query('title') title?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.teacherService.getMyTests(req.user, {
      subject,
      title,
      startDate,
      endDate,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/tests/:id')
  getMyTest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getMyTest(req.user, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/my-subjects')
  getMySubjects(@Request() req) {
    return this.teacherService.getMySubjects(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/students')
  getStudents(@Request() req) {
    return this.teacherService.getStudents(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('/passed-tests')
  getPassedTests(@Request() req) {
    return this.teacherService.getPassedTests(req.user);
  }
}
