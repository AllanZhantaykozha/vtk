import { Controller, Request, Get, UseGuards, Query } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/get-all-students')
  getAllStudents(
    @Query('id') id?: number,
    @Query('login') login?: string,
    @Query('fullName') fullName?: string,
    @Query('groupId') groupId?: number,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.studentService.getAllStudents({
      id: id ? Number(id) : undefined,
      login,
      fullName,
      groupId,
      sortBy,
      order,
    });
  }
}
