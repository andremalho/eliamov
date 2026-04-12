import { IsArray, IsEnum, ArrayMinSize, ArrayMaxSize, IsInt, Min, Max } from 'class-validator';

export class SubmitAssessmentDto {
  @IsEnum(['phq9', 'gad7'])
  type: 'phq9' | 'gad7';

  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(9)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  answers: number[];
}
