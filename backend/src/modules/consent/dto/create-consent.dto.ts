import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateConsentDto {
  @IsString()
  userId: string;

  @IsString()
  consentType: string;

  @IsBoolean()
  granted: boolean;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
