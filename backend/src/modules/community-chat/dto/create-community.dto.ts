import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsEnum(['private', 'public'])
  type?: 'private' | 'public';
}
