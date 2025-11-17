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
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto, SubmitTestDto, UpdateTestDto } from './dto/tests.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Get('getStatistic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStatistic(@Request() req, @Query('groupId') groupId?: string) {
    let parsedGroupId: number | undefined;
    if (groupId) {
      const numericGroupId = groupId.trim();
      if (!/^\d+$/.test(numericGroupId)) {
        throw new BadRequestException(
          'Invalid groupId: must be a numeric string (e.g., "123")',
        );
      }
      parsedGroupId = parseInt(numericGroupId, 10);
    }
    return this.testsService.getStatistic(req.user, parsedGroupId);
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/questions',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async create(
    @Body() createTestDto: CreateTestDto,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.testsService.createTest(createTestDto, req.user, files);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async update(
    @Body() updateTestDto: UpdateTestDto,
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.testsService.updateTest(id, updateTestDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.testsService.deleteTest(id, req.user);
  }

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Post('submit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async submitTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitTestDto: SubmitTestDto,
    @Request() req,
  ) {
    return this.testsService.submitTest(id, submitTestDto, req.user);
  }

  @Post('submissions/:id/check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher', 'admin')
  async updateSubmissionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @Request() req,
  ) {
    return this.testsService.updateSubmissionStatus(id, body.status, req.user);
  }
}

// Пример создания теста с deadline:
// {
//   "title": "Mathematics Test 1",
//   "description": "Basic algebra test",
//   "subjectId": 1,
//   "deadline": "2025-11-15T23:59:59Z",
//   "questions": [
//     {
//       "text": "What is 2 + 2?",
//       "type": "single",
//       "correct": [1],
//       "options": [
//         { "text": "4" },
//         { "text": "22" },
//         { "text": "5" }
//       ]
//     },
//     {
//       "text": "Select all even numbers",
//       "type": "multiple",
//       "correct": [0, 2],
//       "options": [
//         { "text": "2" },
//         { "text": "3" },
//         { "text": "4" }
//       ]
//     }
//   ]
// }
