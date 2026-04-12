import {
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class LogFertilityDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(35.0)
  @Max(39.0)
  basalTemp?: number;

  @IsOptional()
  @IsEnum(['negative', 'low', 'high', 'peak'])
  lhResult?: 'negative' | 'low' | 'high' | 'peak';

  @IsOptional()
  @IsEnum(['dry', 'sticky', 'creamy', 'watery', 'egg_white'])
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  cervixPosition?: number;

  @IsOptional()
  @IsBoolean()
  intercourse?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
