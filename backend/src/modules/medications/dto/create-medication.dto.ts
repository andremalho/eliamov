import { IsString, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateMedicationDto {
  @IsString() @MaxLength(150) name: string;
  @IsEnum(['hormonal_contraceptive', 'hormonal_iud', 'thyroid', 'antidepressant', 'anxiolytic', 'progesterone', 'other'])
  category: string;
  @IsOptional() @IsString() @MaxLength(80) dose?: string;
  @IsOptional() @IsString() @MaxLength(80) frequency?: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
