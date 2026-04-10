import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(['image', 'video', 'none'])
  mediaType?: 'image' | 'video' | 'none';

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
