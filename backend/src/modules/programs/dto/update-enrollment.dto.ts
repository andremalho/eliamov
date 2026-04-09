import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  currentWeek?: number;

  @IsOptional()
  @IsObject()
  progress?: Record<string, any>;
}
