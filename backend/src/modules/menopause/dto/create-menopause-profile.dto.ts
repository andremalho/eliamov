import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMenopauseProfileDto {
  @IsEnum(['perimenopause', 'menopause', 'postmenopause'])
  stage: 'perimenopause' | 'menopause' | 'postmenopause';

  @IsOptional()
  @IsInt()
  ageAtOnset?: number;

  @IsOptional()
  @IsBoolean()
  onHRT?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];
}
