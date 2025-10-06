import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(['teacher', 'student', 'admin'])
  role: 'teacher' | 'student' | 'admin';

  @IsArray()
  @IsInt({ each: true })
  @ValidateIf((o) => o.role === 'teacher')
  @IsNotEmpty({ message: 'subjectIds is required for teachers' })
  subjectIds?: number[];

  @IsInt()
  @ValidateIf((o) => o.role === 'student')
  @IsNotEmpty({ message: 'groupId is required for students' })
  groupId?: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export interface BaseUserInfo {
  id: number;
  login: string;
  fullName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherInfo extends BaseUserInfo {
  subjects: string[];
  testsCount: number;
  lecturesCount: number;
  tests: Array<{
    id: number;
    subject: { id: number; name: string };
    title: string;
    description: string | null;
    uploadDate: string;
    questions: Array<{
      id: number;
      testId: number;
      text: string;
      image: string | null;
      type: string;
      correct: number[];
    }>;
  }>;
  lectures: Array<{
    id: number;
    subject: { id: number; name: string };
    title: string;
    description: string | null;
    uploadDate: string;
  }>;
}

export interface StudentInfo extends BaseUserInfo {
  group: string;
  submissionsCount: number;
  averageScore: number;
  submissions: Array<{
    id: number;
    score: number;
    test: {
      id: number;
      subject: { id: number; name: string };
      uploadDate: string;
    };
  }>;
  subjects: Array<{
    id: number;
    name: string;
    teachers: Array<{
      teacher: {
        id: number;
        user: { fullName: string };
      };
    }>;
  }>;
}

export interface AdminInfo extends BaseUserInfo {
  totalUsers: number;
  users: Array<{ id: number; fullName: string; login: string }>;
  totalStudents: number;
  students: Array<{
    id: number;
    user: { id: number; fullName: string; login: string };
    group: { id: number; name: string } | null;
  }>;
  totalTeachers: number;
  teachers: Array<{
    id: number;
    user: { id: number; fullName: string; login: string };
    subjects: Array<{ subject: { id: number; name: string } }>;
  }>;
  totalGroups: number;
  groups: Array<{ id: number; name: string }>;
  totalSubjects: number;
  subjects: Array<{ id: number; name: string }>;
  totalTests: number;
  tests: Array<{ id: number; subject: { id: number; name: string } }>;
  totalLectures: number;
  lectures: Array<{ id: number; subject: { id: number; name: string } }>;
}
