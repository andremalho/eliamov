import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLabResultDto {
  @IsDateString()
  examDate: string;

  @IsOptional()
  @IsString()
  labName?: string;

  @IsOptional()
  @IsString()
  reportFileUrl?: string;

  @IsOptional()
  values?: Record<string, { value: number; unit: string }>;

  @IsOptional()
  @IsString()
  notes?: string;
}
