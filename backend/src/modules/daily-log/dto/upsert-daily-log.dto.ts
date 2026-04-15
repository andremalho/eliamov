import { IsDateString, IsOptional, IsInt, IsBoolean,
  IsString, Min, Max, MaxLength } from 'class-validator';

export class UpsertDailyLogDto {
  @IsDateString() logDate: string;
  @IsOptional() @IsInt() @Min(0) @Max(5) energyLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) moodScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) libido?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) sleepQuality?: number;
  @IsOptional() @IsInt() @Min(0) @Max(12) sleepHours?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) pelvicPain?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) headache?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) bloating?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) breastTenderness?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) backPain?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) nausea?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) anxiety?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) irritability?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) concentration?: number;
  @IsOptional() @IsBoolean() spotting?: boolean;
  @IsOptional() @IsBoolean() hotFlashes?: boolean;
  @IsOptional() @IsBoolean() nightSweats?: boolean;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
