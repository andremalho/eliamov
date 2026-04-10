import { IsEmail, IsOptional, IsObject } from 'class-validator';

export class InviteCompanionDto {
  @IsEmail()
  companionEmail: string;

  @IsOptional()
  @IsObject()
  permissions?: {
    viewWorkouts?: boolean;
    viewGoals?: boolean;
    viewFeed?: boolean;
  };
}
