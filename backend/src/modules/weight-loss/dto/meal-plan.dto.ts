import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class MealPlanDto {
  @IsEnum(['onivora', 'vegetariana', 'vegana', 'pescetariana', 'low-carb', 'mediterranea'])
  dietType: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(6)
  mealsPerDay?: number;

  @IsOptional()
  @IsEnum(['economico', 'moderado', 'flexivel'])
  budget?: string;
}
