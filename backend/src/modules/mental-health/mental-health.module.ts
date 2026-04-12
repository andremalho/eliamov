import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentalHealthAssessment } from './entities/mental-health-assessment.entity';
import { MentalHealthService } from './mental-health.service';
import { MentalHealthController } from './mental-health.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MentalHealthAssessment])],
  controllers: [MentalHealthController],
  providers: [MentalHealthService],
})
export class MentalHealthModule {}
