import { IsArray, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRecipeDto {
  @IsString() title: string;
  @IsOptional() @IsString() summary?: string;
  @IsString() instructions: string;
  @IsArray() ingredients: { name: string; quantity: string; unit: string }[];
  @IsOptional() @IsObject() macros?: { calories: number; protein: number; carbs: number; fat: number; fiber?: number };
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsInt() @Min(0) prepTimeMinutes?: number;
  @IsOptional() @IsInt() @Min(0) cookTimeMinutes?: number;
  @IsOptional() @IsInt() @Min(1) servings?: number;
  @IsOptional() @IsArray() dietaryRestrictions?: string[];
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsEnum(['follicular', 'ovulatory', 'luteal', 'menstrual', 'all']) cyclePhase?: string;
  @IsOptional() @IsUUID() academyId?: string;
}
