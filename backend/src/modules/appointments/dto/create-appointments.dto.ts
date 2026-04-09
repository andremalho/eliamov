import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentsDto {
  @IsString()
  userId: string;

  @IsString()
  professionalId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  type?: string;
}
