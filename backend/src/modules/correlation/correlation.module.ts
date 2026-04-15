import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationController } from './correlation.controller';
import { CorrelationService } from './correlation.service';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MedicationEntity } from '../medications/entities/medication.entity';
import { MentalHealthAssessmentEntity } from '../mental-health/entities/mental-health-assessment.entity';
import { DailyLogEntity } from '../daily-log/entities/daily-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CycleEntry, MedicationEntity, MentalHealthAssessmentEntity, DailyLogEntity])],
  controllers: [CorrelationController],
  providers: [CorrelationService],
  exports: [CorrelationService],
})
export class CorrelationModule {}
