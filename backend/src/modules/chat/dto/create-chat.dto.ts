import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsEnum(['user', 'professional', 'ai'])
  sender?: 'user' | 'professional' | 'ai';
}
