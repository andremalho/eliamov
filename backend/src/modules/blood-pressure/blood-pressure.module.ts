import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodPressureEntry } from './entities/blood-pressure.entity';
import { BloodPressureService } from './blood-pressure.service';
import { BloodPressureController } from './blood-pressure.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BloodPressureEntry])],
  controllers: [BloodPressureController],
  providers: [BloodPressureService],
  exports: [BloodPressureService],
})
export class BloodPressureModule {}
