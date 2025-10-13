import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from 'src/subjects/dto/subjects.dto';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAll(
    @Request() req,
    @Query('teacherId') teacherId?: string,
    @Query('title') title?: string,
  ) {
    return this.subjectsService.getAll(req.user, {
      title,
      teacherId,
    });
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

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('')
  async createSubject(
    @Body() createSubjectDto: CreateSubjectDto,
    @Request() req,
  ) {
    return this.subjectsService.createSubject(createSubjectDto, req.user);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Request() req,
  ) {
    return this.subjectsService.updateSubject(id, updateSubjectDto, req.user);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteSubject(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.subjectsService.deleteSubject(id, req.user);
  }
}
