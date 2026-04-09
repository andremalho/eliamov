import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionEntry } from './entities/nutrition.entity';
import { WeightEntry } from './entities/weight-entry.entity';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { User } from '../users/entities/user.entity';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionEntry, WeightEntry, NutritionGoal, User])],
  controllers: [NutritionController],
  providers: [NutritionService],
})
export class NutritionModule {}
