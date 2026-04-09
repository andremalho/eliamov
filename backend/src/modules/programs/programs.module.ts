import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessProgram } from './entities/programs.entity';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WellnessProgram])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
