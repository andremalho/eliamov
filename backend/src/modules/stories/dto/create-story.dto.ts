import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  mediaUrl: string;

  @IsEnum(['image', 'video'])
  mediaType: 'image' | 'video';

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  mediaKey?: string;

  @IsOptional()
  @IsString()
  moodTag?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsEnum(['achievement'])
  specialType?: string; // for 48h stories
}
