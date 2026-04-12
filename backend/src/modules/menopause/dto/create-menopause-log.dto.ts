import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateMenopauseLogDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  hotFlashCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  hotFlashIntensity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sleepQuality?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore?: number;

  @IsOptional()
  @IsBoolean()
  vaginalDryness?: boolean;

  @IsOptional()
  @IsBoolean()
  jointPain?: boolean;

  @IsOptional()
  @IsBoolean()
  nightSweats?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
