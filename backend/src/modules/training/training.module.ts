import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPlan, CycleEntry])],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
