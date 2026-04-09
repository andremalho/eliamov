import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CycleEntry } from './entities/cycle.entity';
import { CycleService } from './cycle.service';
import { CycleController } from './cycle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CycleEntry])],
  controllers: [CycleController],
  providers: [CycleService],
  exports: [CycleService],
})
export class CycleModule {}
