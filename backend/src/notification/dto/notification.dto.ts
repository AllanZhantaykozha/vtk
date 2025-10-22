import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  IsInt,
} from 'class-validator';

export enum NotificationEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(NotificationEnum)
  status: NotificationEnum;

  @IsArray()
  @IsInt({ each: true })
  userIds: number[];
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(NotificationEnum)
  status?: NotificationEnum;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  userIds: number[];
}
