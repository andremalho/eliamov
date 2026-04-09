import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type GlucoseContext =
  | 'fasting'
  | 'post_meal_1h'
  | 'post_meal_2h'
  | 'bedtime'
  | 'exercise_before'
  | 'exercise_after';

export class CreateGlucometerDto {
  @IsDateString()
  measuredAt: string;

  @IsInt()
  @Min(20)
  @Max(700)
  value: number;

  @IsEnum(['fasting', 'post_meal_1h', 'post_meal_2h', 'bedtime', 'exercise_before', 'exercise_after'])
  context: GlucoseContext;

  @IsOptional()
  @IsString()
  notes?: string;
}
