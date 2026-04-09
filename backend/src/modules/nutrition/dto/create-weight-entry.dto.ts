import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWeightEntryDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Min(20)
  @Max(300)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waist?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hip?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFat?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
