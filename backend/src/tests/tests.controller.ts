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
  Patch,
  Delete,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto, SubmitTestDto, UpdateTestDto } from './dto/tests.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async create(@Body() createTestDto: CreateTestDto, @Request() req) {
    return this.testsService.createTest(createTestDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async update(
    @Body() UpdateTestDto: UpdateTestDto,
    @Request() req,
    @Param('id') id: number,
  ) {
    return this.testsService.updateTest(id, UpdateTestDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async delete(@Request() req, @Param('id') id: number) {
    return this.testsService.deleteTest(id, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher', 'admin')
  async getTests(
    @Request() req,
    @Query('subject') subject?: string,
    @Query('title') title?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.testsService.getTests(req.user, {
      subject,
      title,
      startDate,
      endDate,
    });
  }

  @Get('my-tests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getMyTests(
    @Request() req,
    @Query('subject') subject?: string,
    @Query('title') title?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.testsService.getTests(req.user, {
      subject,
      title,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'teacher', 'admin')
  async getTestById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.testsService.getTestById(id, req.user);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async submitTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitTestDto: SubmitTestDto,
    @Request() req,
  ) {
    return this.testsService.submitTest(id, submitTestDto, req.user);
  }
}

// {
//   "title": "Mathematics Test 1",
//   "description": "Basic algebra test",
//   "subjectId": 1,
//   "questions": [
//     {
//       "text": "What is 2 + 2?",
//       "type": "single",
//       "correct": [1],
//       "options": [
//         { "id": 1, "text": "4" },
//         { "id": 2, "text": "22" },
//         { "id": 3, "text": "5" }
//       ]
//     },
//     {
//       "text": "Select all even numbers",
//       "type": "multiple",
//       "correct": [1, 3],
//       "options": [
//         { "id": 1, "text": "2" },
//         { "id": 2, "text": "3" },
//         { "id": 3, "text": "4" }
//       ]
//     }
//   ]
// }
