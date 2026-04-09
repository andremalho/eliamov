import { IsOptional, IsString } from 'class-validator';

export class CreateContentDto {
  @IsString()
  authorId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
