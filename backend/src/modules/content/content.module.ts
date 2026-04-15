import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Video } from './entities/video.entity';
import { ContentCategory } from './entities/content-category.entity';
import { UserSavedContent } from './entities/user-saved-content.entity';
import { CycleModule } from '../cycle/cycle.module';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Video, ContentCategory, UserSavedContent]), CycleModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
