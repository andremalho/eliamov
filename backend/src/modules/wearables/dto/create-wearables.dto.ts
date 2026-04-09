import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateWearablesDto {
  @IsEnum(['garmin', 'strava', 'polar', 'oura', 'fitbit', 'apple_health', 'whoop'])
  provider: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class WebhookDataDto {
  @IsString()
  provider: string;
}
