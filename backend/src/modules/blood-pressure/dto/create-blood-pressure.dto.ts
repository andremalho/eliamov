import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type BpContext = 'rest' | 'post_exercise' | 'morning' | 'evening';

export class CreateBloodPressureDto {
  @IsDateString()
  measuredAt: string;

  @IsInt()
  @Min(50)
  @Max(260)
  systolic: number;

  @IsInt()
  @Min(30)
  @Max(180)
  diastolic: number;

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(220)
  heartRate?: number;

  @IsEnum(['rest', 'post_exercise', 'morning', 'evening'])
  context: BpContext;

  @IsOptional()
  @IsString()
  notes?: string;
}
