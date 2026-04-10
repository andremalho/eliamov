import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('feed')
export class FeedController {
  constructor(private readonly service: FeedService) {}

  @Get()
  getFeed(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Query() query: FeedQueryDto,
  ) {
    return this.service.getFeed(user.tenantId, user.userId, query);
  }

  @Post('posts')
  createPost(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.service.createPost(user.userId, user.tenantId, dto);
  }

  @Post('posts/:id/like')
  like(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.likePost(id, user.userId);
  }

  @Delete('posts/:id/like')
  unlike(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.unlikePost(id, user.userId);
  }

  @Post('posts/:id/reactions')
  addReaction(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.service.addReaction(id, user.userId, dto);
  }

  @Delete('posts/:id/reactions/:reaction')
  removeReaction(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Param('reaction') reaction: string,
  ) {
    return this.service.removeReaction(id, user.userId, reaction);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') id: string) {
    return this.service.getComments(id);
  }

  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.addComment(id, user.userId, dto);
  }

  @Delete('posts/:id')
  deletePost(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.deletePost(id, user.userId);
  }
}
