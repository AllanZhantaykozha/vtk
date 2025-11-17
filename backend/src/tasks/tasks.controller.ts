// tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming you have JWT auth guards
import { RolesGuard } from '../auth/roles.guard'; // Assuming roles guard
import { Roles } from '../auth/roles.decorator'; // Assuming roles decorator
import { CreateTaskDto, SubmitTaskDto, UpdateTaskDto } from './dto/task.dto';
import { TestSubmissionStatus } from '@prisma/client'; // Import from Prisma

class CheckTaskSubmissionDto {
  score: number;
  status: TestSubmissionStatus;
}

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Create a new task (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  async findAll(@Request() req) {
    return this.tasksService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Update a task (Teacher only, own task)' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Delete a task (Teacher only, own task)' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user.userId;
    return this.tasksService.remove(id, userId);
  }

  @Post('submit/:id')
  @UseGuards(RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Submit a task (Student only, before deadline)' })
  @ApiResponse({ status: 201, description: 'Task submitted successfully' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitTaskDto: SubmitTaskDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.tasksService.submit(id, submitTaskDto, userId);
  }

  @Post(':taskId/submissions/:submissionId/check')
  @UseGuards(RolesGuard)
  @Roles('teacher')
  @ApiOperation({
    summary: 'Check and grade a task submission (Teacher only, own task)',
  })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiBody({ type: CheckTaskSubmissionDto })
  async checkSubmission(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() checkDto: CheckTaskSubmissionDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.tasksService.checkSubmission(
      taskId,
      submissionId,
      checkDto.score,
      checkDto.status,
      userId,
    );
  }
}
