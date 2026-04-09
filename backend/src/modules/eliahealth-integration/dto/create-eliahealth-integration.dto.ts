import { IsOptional, IsString } from 'class-validator';

export class CreateEliahealthIntegrationDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
