import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the task', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Subject ID the task belongs to' })
  @IsNumber()
  @Min(1)
  subjectId: number;

  @ApiProperty({ description: 'Deadline for the task submission' })
  @IsDateString()
  deadline: string;

  @ApiProperty({
    description: 'File content as base64 string (optional)',
    required: false,
  })
  @IsOptional()
  fileContent?: string; // Assuming base64 for Bytes in DTO
}

export class UpdateTaskDto {
  @ApiProperty({ description: 'Title of the task', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Description of the task', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Deadline for the task submission',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiProperty({
    description: 'File content as base64 string (optional)',
    required: false,
  })
  @IsOptional()
  fileContent?: string; // Assuming base64 for Bytes in DTO
}

export class SubmitTaskDto {
  @ApiProperty({ description: 'Text submission (optional)' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'File content as base64 string (optional)' })
  @IsOptional()
  fileContent?: string; // Assuming base64 for Bytes in DTO
}
