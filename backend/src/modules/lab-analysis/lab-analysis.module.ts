import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabResult } from './entities/lab-result.entity';
import { LabAnalysisService } from './lab-analysis.service';
import { LabAnalysisController } from './lab-analysis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabResult])],
  controllers: [LabAnalysisController],
  providers: [LabAnalysisService],
  exports: [LabAnalysisService],
})
export class LabAnalysisModule {}
