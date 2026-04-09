import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTrainingDto {
  @IsString()
  userId: string;

  @IsDateString()
  weekStart: string;

  @IsDateString()
  weekEnd: string;

  @IsOptional()
  planJson?: any;
}
