import { IsOptional, IsUUID, IsString } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsUUID()
  activityId?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
