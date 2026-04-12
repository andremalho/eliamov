import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePerformanceLogDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  hrv?: number;

  @IsOptional()
  @IsNumber()
  restingHR?: number;

  @IsOptional()
  @IsNumber()
  basalTemp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  sleepScore?: number;

  @IsOptional()
  @IsInt()
  sleepHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsInt()
  trainingLoad?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  fatigueScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  vigorScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
