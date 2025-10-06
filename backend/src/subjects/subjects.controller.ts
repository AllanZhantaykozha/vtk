import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAll() {
    return this.subjectsService.getAll();
  }

  @Get('with-students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  getSubjectsWithStudents(@Request() req) {
    return this.subjectsService.getSubjectsWithStudents(req.user);
  }

  @Get('teacher-navbar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  getTeacherNavbar(@Request() req) {
    return this.subjectsService.getTeacherNavbar(req.user);
  }

  @Get('get-my-subjects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  getMySubjects(@Request() req) {
    return this.subjectsService.getMySubjects(req.user);
  }
}
