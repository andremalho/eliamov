import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pregnancy } from './entities/pregnancy.entity';
import { PregnancyWeek } from './entities/pregnancy-week.entity';
import { PregnancyService } from './pregnancy.service';
import { PregnancyController } from './pregnancy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pregnancy, PregnancyWeek])],
  controllers: [PregnancyController],
  providers: [PregnancyService],
})
export class PregnancyModule {}
