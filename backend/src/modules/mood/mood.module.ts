import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodEntry } from './entities/mood.entity';
import { MoodService } from './mood.service';
import { MoodController } from './mood.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MoodEntry])],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
