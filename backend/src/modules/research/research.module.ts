import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchData } from './entities/research.entity';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ResearchData])],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
