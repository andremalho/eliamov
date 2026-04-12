import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilityLog } from './entities/fertility-log.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { FertilityService } from './fertility.service';
import { FertilityController } from './fertility.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FertilityLog, CycleEntry])],
  controllers: [FertilityController],
  providers: [FertilityService],
})
export class FertilityModule {}
