import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabExam } from './entities/lab-exam.entity';
import { LabExamsService } from './lab-exams.service';
import { LabExamsController } from './lab-exams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabExam])],
  controllers: [LabExamsController],
  providers: [LabExamsService],
})
export class LabExamsModule {}
