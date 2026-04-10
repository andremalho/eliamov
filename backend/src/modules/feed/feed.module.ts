import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostReaction } from './entities/post-reaction.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostLike,
      PostComment,
      PostReaction,
      CycleEntry,
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
