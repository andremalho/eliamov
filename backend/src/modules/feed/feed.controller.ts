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

  @Post()
  createPost(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.service.createPost(user.userId, user.tenantId, dto);
  }

  @Post(':postId/like')
  like(
    @CurrentUser() user: { userId: string },
    @Param('postId') postId: string,
  ) {
    return this.service.likePost(postId, user.userId);
  }

  @Delete(':postId/like')
  unlike(
    @CurrentUser() user: { userId: string },
    @Param('postId') postId: string,
  ) {
    return this.service.unlikePost(postId, user.userId);
  }

  @Get(':postId/comments')
  getComments(@Param('postId') postId: string) {
    return this.service.getComments(postId);
  }

  @Post(':postId/comments')
  addComment(
    @CurrentUser() user: { userId: string },
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.addComment(postId, user.userId, dto);
  }

  @Delete(':postId')
  deletePost(
    @CurrentUser() user: { userId: string },
    @Param('postId') postId: string,
  ) {
    return this.service.deletePost(postId, user.userId);
  }
}
