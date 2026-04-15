import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentalHealthController } from './mental-health.controller';
import { MentalHealthService } from './mental-health.service';
import { MentalHealthAssessmentEntity } from './entities/mental-health-assessment.entity';
import { MentalHealthPatternEntity } from './entities/mental-health-pattern.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MentalHealthAssessmentEntity, MentalHealthPatternEntity, CycleEntry])],
  controllers: [MentalHealthController],
  providers: [MentalHealthService],
  exports: [MentalHealthService],
})
export class MentalHealthModule {}
