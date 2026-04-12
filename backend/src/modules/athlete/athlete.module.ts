import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceLog } from './entities/performance-log.entity';
import { AthleteService } from './athlete.service';
import { AthleteController } from './athlete.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceLog])],
  controllers: [AthleteController],
  providers: [AthleteService],
  exports: [AthleteService],
})
export class AthleteModule {}
