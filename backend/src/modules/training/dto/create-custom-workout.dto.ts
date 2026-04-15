import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCustomWorkoutDto {
  @IsString() name: string;
  @IsEnum(['menstrual', 'follicular', 'ovulatory', 'luteal']) phase: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsInt() @Min(1) duration?: number;
  @IsOptional() @IsEnum(['low', 'moderate', 'high', 'max']) intensity?: string;
  @IsOptional() @IsString() rpe?: string;
  @IsArray() exercises: { name: string; sets?: number; reps?: string; duration?: string; rest?: string; notes?: string }[];
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() academyId?: string;
}
