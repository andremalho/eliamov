import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCoursesDto {
  @IsString()
  instructorId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}
