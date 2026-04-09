import { IsOptional, IsString } from 'class-validator';

export class CreateResearchDto {
  @IsOptional()
  @IsString()
  ageGroup?: string;

  @IsOptional()
  @IsString()
  fitnessGoal?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
