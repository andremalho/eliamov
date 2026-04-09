import { IsOptional, IsString } from 'class-validator';

export class CreateAiEngineDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  query?: string;
}
