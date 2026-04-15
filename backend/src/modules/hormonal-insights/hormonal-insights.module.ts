import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HormonalInsightsController } from './hormonal-insights.controller';
import { HormonalInsightsService } from './hormonal-insights.service';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { HormonalInsightEntity } from './entities/hormonal-insight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CycleEntry, HormonalInsightEntity])],
  controllers: [HormonalInsightsController],
  providers: [HormonalInsightsService],
  exports: [HormonalInsightsService],
})
export class HormonalInsightsModule {}
