import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAdsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsEnum(['banner', 'card', 'inline'])
  format?: 'banner' | 'card' | 'inline';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
