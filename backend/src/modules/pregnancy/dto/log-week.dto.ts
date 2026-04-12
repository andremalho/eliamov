import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class LogWeekDto {
  @IsInt()
  @Min(1)
  @Max(42)
  weekNumber: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  energyScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
