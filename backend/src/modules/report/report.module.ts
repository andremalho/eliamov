import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MedicationEntity } from '../medications/entities/medication.entity';
import { MentalHealthAssessmentEntity } from '../mental-health/entities/mental-health-assessment.entity';
import { MentalHealthPatternEntity } from '../mental-health/entities/mental-health-pattern.entity';
import { HormonalInsightEntity } from '../hormonal-insights/entities/hormonal-insight.entity';
import { DailyLogEntity } from '../daily-log/entities/daily-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CycleEntry, MedicationEntity, MentalHealthAssessmentEntity, MentalHealthPatternEntity, HormonalInsightEntity, DailyLogEntity])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
