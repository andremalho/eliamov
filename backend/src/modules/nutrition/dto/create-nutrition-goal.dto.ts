import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateNutritionGoalDto {
  @IsInt()
  @Min(0)
  dailyCalories: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyProtein?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyCarbs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyFat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyWater?: number;

  @IsOptional()
  @IsEnum(['weight_loss', 'maintenance', 'muscle_gain'])
  goal?: 'weight_loss' | 'maintenance' | 'muscle_gain';
}
