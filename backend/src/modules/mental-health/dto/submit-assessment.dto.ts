import { IsEnum, IsObject } from 'class-validator';

export class SubmitAssessmentDto {
  @IsEnum(['phq9', 'gad7', 'pss10', 'drsp', 'mrs'])
  assessmentType: 'phq9' | 'gad7' | 'pss10' | 'drsp' | 'mrs';

  @IsObject()
  answers: Record<string, number>;
}
