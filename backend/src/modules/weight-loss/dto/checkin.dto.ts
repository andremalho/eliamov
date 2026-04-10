import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CheckinDto {
  @IsInt() @Min(1) weekNumber: number;
  @IsNumber() @Min(30) @Max(300) weightKg: number;
  @IsInt() @Min(0) @Max(100) adherencePercent: number;
  @IsOptional() @IsString() notes?: string;
}
