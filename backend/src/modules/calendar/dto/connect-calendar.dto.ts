import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class ConnectCalendarDto {
  @IsEnum(['google', 'microsoft'])
  provider: 'google' | 'microsoft';

  @IsOptional()
  @IsBoolean()
  syncWorkouts?: boolean;

  @IsOptional()
  @IsBoolean()
  syncAppointments?: boolean;

  @IsOptional()
  @IsBoolean()
  syncCyclePredictions?: boolean;

  @IsOptional()
  @IsBoolean()
  syncChallenges?: boolean;
}
