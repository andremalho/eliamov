import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProgramsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['training', 'nutrition', 'wellness', 'recovery'])
  category?: 'training' | 'nutrition' | 'wellness' | 'recovery';

  @IsOptional()
  @IsInt()
  @Min(1)
  durationWeeks?: number;

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsBoolean()
  cycleAware?: boolean;
}
