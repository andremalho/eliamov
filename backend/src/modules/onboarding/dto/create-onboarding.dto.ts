import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateOnboardingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  currentStep?: number;

  @IsOptional()
  data?: Record<string, any>;
}
