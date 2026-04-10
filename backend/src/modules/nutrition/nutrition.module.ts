import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionEntry } from './entities/nutrition.entity';
import { WeightEntry } from './entities/weight-entry.entity';
import { NutritionGoal } from './entities/nutrition-goal.entity';
import { BodyComposition } from './entities/body-composition.entity';
import { User } from '../users/entities/user.entity';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionEntry, WeightEntry, NutritionGoal, BodyComposition, User])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
