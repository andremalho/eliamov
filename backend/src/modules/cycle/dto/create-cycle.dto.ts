import { IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateCycleDto {
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(45)
  cycleLength?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  periodLength?: number;
}
