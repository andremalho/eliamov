import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(250)
  height?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthConditions?: string[];

  @IsOptional()
  @IsEnum(['sedentary', 'beginner', 'intermediate', 'advanced'])
  fitnessLevel?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsEnum(['weight_loss', 'health', 'strength', 'wellbeing', 'pregnancy', 'bone_health'])
  fitnessGoal?:
    | 'weight_loss'
    | 'health'
    | 'strength'
    | 'wellbeing'
    | 'pregnancy'
    | 'bone_health';

  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  markOnboardingComplete?: boolean;
}
