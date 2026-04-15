import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyLogController } from './daily-log.controller';
import { DailyLogService } from './daily-log.service';
import { DailyLogEntity } from './entities/daily-log.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyLogEntity, CycleEntry])],
  controllers: [DailyLogController],
  providers: [DailyLogService],
  exports: [DailyLogService],
})
export class DailyLogModule {}
