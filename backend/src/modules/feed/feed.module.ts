import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { ActivityPost } from './entities/activity-post.entity';
import { ActivityLike } from './entities/activity-like.entity';
import { ActivityComment } from './entities/activity-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityPost, ActivityLike, ActivityComment]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
