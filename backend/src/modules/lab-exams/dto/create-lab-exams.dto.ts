import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLabExamsDto {
  @IsString()
  userId: string;

  @IsString()
  examType: string;

  @IsDateString()
  examDate: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
