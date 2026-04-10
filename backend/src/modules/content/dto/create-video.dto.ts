import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateVideoDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() videoUrl: string;
  @IsOptional() @IsString() thumbnailUrl?: string;
  @IsOptional() @IsInt() @Min(0) durationSeconds?: number;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsEnum(['follicular', 'ovulatory', 'luteal', 'menstrual', 'all']) cyclePhase?: string;
  @IsOptional() @IsUUID() academyId?: string;
}
