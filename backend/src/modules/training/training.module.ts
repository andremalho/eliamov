import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPlan } from './entities/training.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPlan])],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
