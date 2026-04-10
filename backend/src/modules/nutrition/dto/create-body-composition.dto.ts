import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateBodyCompositionDto {
  @IsDateString() date: string;
  @IsOptional() @IsEnum(['bioimpedance', 'dexa', 'manual']) method?: string;
  @IsOptional() @IsNumber() @Min(3) @Max(60) bodyFatPercent?: number;
  @IsOptional() @IsNumber() @Min(10) @Max(100) muscleMassKg?: number;
  @IsOptional() @IsNumber() boneMassKg?: number;
  @IsOptional() @IsNumber() waterPercent?: number;
  @IsOptional() @IsNumber() visceralFat?: number;
  @IsOptional() @IsNumber() basalMetabolism?: number;
  @IsOptional() @IsString() reportFileUrl?: string;
  @IsOptional() @IsString() notes?: string;
}
