import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ActivityPost } from './entities/activity-post.entity';
import { ActivityLike } from './entities/activity-like.entity';
import { ActivityComment } from './entities/activity-comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(ActivityPost)
    private readonly postRepo: Repository<ActivityPost>,
    @InjectRepository(ActivityLike)
    private readonly likeRepo: Repository<ActivityLike>,
    @InjectRepository(ActivityComment)
    private readonly commentRepo: Repository<ActivityComment>,
  ) {}

  async getFeed(tenantId: string, userId: string, query: FeedQueryDto) {
    const limit = query.limit ?? 15;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.activity', 'activity')
      .where('post.tenantId = :tenantId', { tenantId })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (query.cursor) {
      qb.andWhere('post.createdAt < :cursor', {
        cursor: new Date(query.cursor),
      });
    }

    const results = await qb.getMany();
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    const postIds = data.map((p) => p.id);
    const userLikes =
      postIds.length > 0
        ? await this.likeRepo.find({ where: { userId, postId: In(postIds) } })
        : [];
    const likedPostIds = new Set(userLikes.map((l) => l.postId));

    const feed = data.map((post) => ({
      ...post,
      user: post.user
        ? {
            id: post.user.id,
            name: post.user.name,
            avatarUrl: post.user.profile?.avatarUrl ?? null,
          }
        : null,
      liked: likedPostIds.has(post.id),
    }));

    return {
      data: feed,
      nextCursor: hasMore
        ? data[data.length - 1].createdAt.toISOString()
        : null,
    };
  }

  async createPost(userId: string, tenantId: string, dto: CreatePostDto) {
    const post = this.postRepo.create({
      userId,
      tenantId,
      activityId: dto.activityId ?? null,
      content: dto.content ?? null,
    });
    return this.postRepo.save(post);
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.likeRepo.findOneBy({ postId, userId });
    if (existing) {
      return { liked: true };
    }

    const like = this.likeRepo.create({ postId, userId });
    await this.likeRepo.save(like);
    await this.postRepo.increment({ id: postId }, 'likesCount', 1);

    return { liked: true };
  }

  async unlikePost(postId: string, userId: string) {
    const like = await this.likeRepo.findOneBy({ postId, userId });
    if (!like) {
      return { liked: false };
    }

    await this.likeRepo.remove(like);
    await this.postRepo.decrement({ id: postId }, 'likesCount', 1);

    return { liked: false };
  }

  async getComments(postId: string) {
    return this.commentRepo.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      select: {
        id: true,
        postId: true,
        userId: true,
        content: true,
        createdAt: true,
        user: {
          id: true,
          name: true,
          profile: true,
        },
      },
    });
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({
      postId,
      userId,
      content: dto.content,
    });
    const saved = await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);

    const withUser = await this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
      select: {
        id: true,
        postId: true,
        userId: true,
        content: true,
        createdAt: true,
        user: {
          id: true,
          name: true,
          profile: true,
        },
      },
    });

    return withUser;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.commentRepo.delete({ postId });
    await this.likeRepo.delete({ postId });
    await this.postRepo.remove(post);

    return { deleted: true };
  }
}
