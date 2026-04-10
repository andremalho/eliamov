import { IsString, IsUUID } from 'class-validator';

export class TrainerCommentDto {
  @IsUUID()
  workoutId: string;

  @IsString()
  comment: string;
}
