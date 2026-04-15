import { IsString, IsOptional, IsDateString, IsBoolean, MaxLength } from 'class-validator';

export class UpdateMedicationDto {
  @IsOptional() @IsString() @MaxLength(150) name?: string;
  @IsOptional() @IsString() @MaxLength(80) dose?: string;
  @IsOptional() @IsString() @MaxLength(80) frequency?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
