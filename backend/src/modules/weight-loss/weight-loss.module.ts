import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeightLossAssessment } from './entities/weight-loss-assessment.entity';
import { WeightLossCheckin } from './entities/weight-loss-checkin.entity';
import { WeightLossController } from './weight-loss.controller';
import { WeightLossService } from './weight-loss.service';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeightLossAssessment, WeightLossCheckin]),
    NutritionModule,
    ProgramsModule,
  ],
  controllers: [WeightLossController],
  providers: [WeightLossService],
  exports: [WeightLossService],
})
export class WeightLossModule {}
