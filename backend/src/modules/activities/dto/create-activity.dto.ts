import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startedAt: string;

  @IsInt()
  @Min(0)
  duration: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  avgHeartRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxHeartRate?: number;

  @IsOptional()
  @IsNumber()
  elevationGain?: number;

  @IsOptional()
  @IsString()
  polyline?: string;

  @IsOptional()
  @IsString()
  mapImageUrl?: string;

  @IsOptional()
  @IsNumber()
  startLat?: number;

  @IsOptional()
  @IsNumber()
  startLng?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
