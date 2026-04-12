import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePregnancyDto {
  @IsDateString()
  lastMenstrualDate: string;

  @IsOptional()
  @IsNumber()
  prePregnancyWeight?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
