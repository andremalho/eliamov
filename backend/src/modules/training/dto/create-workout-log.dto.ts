import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkoutLogDto {
  @IsString() workoutName: string;
  @IsString() phase: string;
  @IsInt() @Min(0) durationSeconds: number;
  @IsOptional() @IsInt() rpe?: number;
  @IsArray() exercises: { name: string; sets: { reps?: number; weight?: number; duration?: number; completed: boolean }[] }[];
  @IsOptional() @IsString() notes?: string;
}
