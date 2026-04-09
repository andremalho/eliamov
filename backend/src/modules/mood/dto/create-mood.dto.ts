import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateMoodDto {
  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  @Max(5)
  energy: number;

  @IsInt()
  @Min(1)
  @Max(5)
  mood: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHours?: number;

  @IsOptional()
  @IsBoolean()
  pain?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
