import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateTeleconsultDto {
  @IsUUID()
  professionalId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
