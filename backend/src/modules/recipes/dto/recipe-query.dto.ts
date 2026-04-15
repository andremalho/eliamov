import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeQueryDto {
  @IsOptional() @IsEnum(['follicular', 'ovulatory', 'luteal', 'menstrual', 'all']) phase?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() restriction?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number = 15;
  @IsOptional() @IsString() search?: string;
}
