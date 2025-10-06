import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  subjectIds?: number[];
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  subjectIds?: number[];
}
