import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostReaction } from './entities/post-reaction.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { CyclePhaseTag } from './entities/post.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly commentRepo: Repository<PostComment>,
    @InjectRepository(PostReaction)
    private readonly reactionRepo: Repository<PostReaction>,
    @InjectRepository(CycleEntry)
    private readonly cycleRepo: Repository<CycleEntry>,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Feed                                                               */
  /* ------------------------------------------------------------------ */

  async getFeed(academyId: string, userId: string, query: FeedQueryDto) {
    const limit = query.limit ?? 15;

    const qb = this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.workout', 'w')
      .where('p.academyId = :academyId', { academyId })
      .orderBy('p.createdAt', 'DESC')
      .take(limit + 1);

    if (query.cursor) {
      qb.andWhere('p.createdAt < :cursor', {
        cursor: new Date(query.cursor),
      });
    }

    const results = await qb.getMany();
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    // Check which posts the current user has liked
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

  /* ------------------------------------------------------------------ */
  /*  Create post                                                        */
  /* ------------------------------------------------------------------ */

  async createPost(userId: string, academyId: string, dto: CreatePostDto) {
    const cyclePhase = await this.detectCyclePhase(userId);

    const postType = dto.postType ?? (dto.workoutId ? 'workout' : 'free');

    const post = this.postRepo.create({
      userId,
      academyId,
      postType,
      content: dto.content ?? null,
      mediaUrls: dto.mediaUrls ?? [],
      workoutId: dto.workoutId ?? null,
      cyclePhase,
    });

    return this.postRepo.save(post);
  }

  /* ------------------------------------------------------------------ */
  /*  Likes                                                              */
  /* ------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------ */
  /*  Reactions                                                          */
  /* ------------------------------------------------------------------ */

  async addReaction(postId: string, userId: string, dto: CreateReactionDto) {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.reactionRepo.findOneBy({
      postId,
      userId,
      reaction: dto.reaction,
    });
    if (existing) {
      return existing;
    }

    const reaction = this.reactionRepo.create({
      postId,
      userId,
      reaction: dto.reaction,
    });
    return this.reactionRepo.save(reaction);
  }

  async removeReaction(postId: string, userId: string, reaction: string) {
    const existing = await this.reactionRepo.findOneBy({
      postId,
      userId,
      reaction: reaction as any,
    });
    if (!existing) {
      return { removed: true };
    }

    await this.reactionRepo.remove(existing);
    return { removed: true };
  }

  /* ------------------------------------------------------------------ */
  /*  Comments                                                           */
  /* ------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------ */
  /*  Delete post                                                        */
  /* ------------------------------------------------------------------ */

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.reactionRepo.delete({ postId });
    await this.commentRepo.delete({ postId });
    await this.likeRepo.delete({ postId });
    await this.postRepo.remove(post);

    return { deleted: true };
  }

  /* ------------------------------------------------------------------ */
  /*  Suggest post after workout                                         */
  /* ------------------------------------------------------------------ */

  async suggestPostAfterWorkout(activityId: string, userId: string) {
    const cyclePhase = await this.detectCyclePhase(userId);

    return {
      suggestion: true,
      postType: 'workout' as const,
      workoutId: activityId,
      cyclePhase,
      prompt: 'Share your workout with the community?',
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  private async detectCyclePhase(
    userId: string,
  ): Promise<CyclePhaseTag> {
    const entry = await this.cycleRepo.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });
    if (!entry) return null;

    const cycleLength = entry.cycleLength ?? 28;
    const periodLength = entry.periodLength ?? 5;
    const start = new Date(entry.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dayIndex = diffDays % cycleLength;

    if (dayIndex < periodLength) return 'menstrual';
    const ovulationDay = cycleLength - 14;
    if (dayIndex < ovulationDay - 1) return 'follicular';
    if (dayIndex <= ovulationDay + 1) return 'ovulatory';
    return 'luteal';
  }
}
