import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateNutritionDto {
  @IsDateString()
  date: string;

  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  fiber?: number;

  @IsOptional()
  @IsNumber()
  water?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
