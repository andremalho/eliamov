import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Story } from './entities/story.entity';
import { StoryView } from './entities/story-view.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MediaModule } from '../media/media.module';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { StoriesCron } from './stories.cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Story, StoryView, CycleEntry]),
    MediaModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService, StoriesCron],
})
export class StoriesModule {}
