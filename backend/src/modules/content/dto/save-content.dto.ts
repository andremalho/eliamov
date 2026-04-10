import { IsEnum, IsUUID } from 'class-validator';

export class SaveContentDto {
  @IsEnum(['article', 'video']) contentType: 'article' | 'video';
  @IsUUID() contentId: string;
}
