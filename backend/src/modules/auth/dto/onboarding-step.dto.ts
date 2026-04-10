import { IsInt, IsObject, Min } from 'class-validator';

export class OnboardingStepDto {
  @IsInt()
  @Min(1)
  step: number;

  @IsObject()
  data: Record<string, any>;
}
