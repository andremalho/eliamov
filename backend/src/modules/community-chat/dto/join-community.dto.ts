import { IsOptional, IsString } from 'class-validator';

export class JoinCommunityDto {
  @IsOptional()
  @IsString()
  code?: string; // invite code for private communities
}
