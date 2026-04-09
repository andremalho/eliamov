import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateNotificationsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEnum(['info', 'warning', 'reminder'])
  type?: 'info' | 'warning' | 'reminder';
}
