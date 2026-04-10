import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['workout_count', 'duration', 'streak'])
  goalType: 'workout_count' | 'duration' | 'streak';

  @IsInt()
  @Min(1)
  goalValue: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
