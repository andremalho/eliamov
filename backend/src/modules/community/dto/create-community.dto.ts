import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsEnum(['post', 'question', 'tip'])
  type?: 'post' | 'question' | 'tip';

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
