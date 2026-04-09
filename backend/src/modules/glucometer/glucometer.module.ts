import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlucoseEntry } from './entities/glucometer.entity';
import { GlucometerService } from './glucometer.service';
import { GlucometerController } from './glucometer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GlucoseEntry])],
  controllers: [GlucometerController],
  providers: [GlucometerService],
  exports: [GlucometerService],
})
export class GlucometerModule {}
