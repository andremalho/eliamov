import { IsArray, IsOptional, IsString } from 'class-validator';

export class PrescribeWorkoutDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  workoutPlan?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scheduledDates?: string[];
}
