import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateSubjectDto {
  @IsString()
  name: string;
}
