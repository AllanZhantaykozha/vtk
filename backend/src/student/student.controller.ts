import { Controller, Request, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @Get('/my-subjects')
  getMySubjects(@Request() req) {
    return this.studentService.getMySubjects(req.user);
  }
}
