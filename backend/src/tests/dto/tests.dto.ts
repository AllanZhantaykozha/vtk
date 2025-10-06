import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  ArrayNotEmpty,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class OptionDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(['single', 'multiple'])
  type: 'single' | 'multiple';

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  correct: number[];
}

export class CreateTestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  subjectId: number;

  @IsString()
  @IsNotEmpty()
  uploadDate: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class SubmitTestDto {
  @IsObject()
  @IsArray({ each: true })
  @ArrayNotEmpty({ each: true })
  @IsInt({ each: true })
  @Min(0, { each: true })
  answers: Record<number, number[]>;
}

export class UpdateTestDto extends PartialType(CreateTestDto) {}
