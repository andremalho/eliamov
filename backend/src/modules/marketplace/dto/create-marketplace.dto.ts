import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateMarketplaceDto {
  @IsString()
  sellerId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;
}
