import { IsEnum } from 'class-validator';

export class CreateReactionDto {
  @IsEnum(['heart', 'fire', 'muscle'])
  reaction: 'heart' | 'fire' | 'muscle';
}
