import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training.entity';
import { CustomWorkout } from './entities/custom-workout.entity';
import { WorkoutLog } from './entities/workout-log.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPlan, CustomWorkout, WorkoutLog, CycleEntry])],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
