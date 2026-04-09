import { IsOptional, IsString } from 'class-validator';

export class CreateWearablesDto {
  @IsString()
  userId: string;

  @IsString()
  device: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
