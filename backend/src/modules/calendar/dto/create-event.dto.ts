import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsOptional()
  @IsEnum(['workout', 'appointment', 'cycle', 'challenge', 'custom'])
  eventType?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
