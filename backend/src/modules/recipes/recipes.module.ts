import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, CycleEntry])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
