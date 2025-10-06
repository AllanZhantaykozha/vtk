import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateLectureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsNotEmpty()
  subjectId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  uploadDate: string;

  @IsString()
  @IsNotEmpty()
  fileContent: string;
}

export class UpdateLectureDto extends PartialType(CreateLectureDto) {}
