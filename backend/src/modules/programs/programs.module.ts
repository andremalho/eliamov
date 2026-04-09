import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessProgram } from './entities/programs.entity';
import { ProgramEnrollment } from './entities/program-enrollment.entity';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WellnessProgram, ProgramEnrollment])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
