import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsEnum(['workout', 'free', 'achievement'])
  postType?: 'workout' | 'free' | 'achievement';

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsUUID()
  workoutId?: string;
}
