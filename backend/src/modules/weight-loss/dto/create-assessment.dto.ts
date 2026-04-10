import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateAssessmentDto {
  @IsInt() @Min(16) @Max(80) age: number;
  @IsEnum(['M', 'F']) biologicalSex: 'M' | 'F';
  @IsNumber() @Min(30) @Max(300) weightKg: number;
  @IsNumber() @Min(100) @Max(250) heightCm: number;
  @IsNumber() activityFactor: number; // 1.2, 1.375, 1.55, 1.725, 1.9
  @IsNumber() @Min(30) @Max(250) targetWeightKg: number;
  @IsInt() @Min(3) @Max(12) deadlineMonths: number;
  @IsEnum(['none', 'dm2', 'hypertension', 'metabolic_syndrome', 'pcos'])
  comorbidity: 'none' | 'dm2' | 'hypertension' | 'metabolic_syndrome' | 'pcos';
}
