import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateArticleDto {
  @IsString() title: string;
  @IsOptional() @IsString() summary?: string;
  @IsString() body: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsEnum(['follicular', 'ovulatory', 'luteal', 'menstrual', 'all']) cyclePhase?: string;
  @IsOptional() @IsUUID() academyId?: string;
}
