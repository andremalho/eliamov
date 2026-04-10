import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Story } from './entities/story.entity';
import { StoryView } from './entities/story-view.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { MediaService } from '../media/media.service';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    @InjectRepository(StoryView) private viewRepo: Repository<StoryView>,
    @InjectRepository(CycleEntry) private cycleRepo: Repository<CycleEntry>,
    private readonly mediaService: MediaService,
  ) {}

  async getStories(academyId: string, userId: string) {
    const stories = await this.storyRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'u')
      .where('s.academyId = :academyId', { academyId })
      .andWhere('s.expiresAt > :now', { now: new Date() })
      .andWhere('s.deletedAt IS NULL')
      .orderBy('s.createdAt', 'DESC')
      .getMany();

    // Check which stories the current user has viewed
    const storyIds = stories.map((s) => s.id);
    const views =
      storyIds.length > 0
        ? await this.viewRepo.find({
            where: { viewerId: userId, storyId: In(storyIds) },
          })
        : [];
    const viewedSet = new Set(views.map((v) => v.storyId));

    // Group by user
    const userMap = new Map<string, any>();
    for (const story of stories) {
      const uid = story.userId;
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          userId: uid,
          name: story.user?.name ?? 'Unknown',
          avatarUrl: story.user?.profile?.avatarUrl ?? null,
          stories: [],
        });
      }
      userMap.get(uid).stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        thumbnailUrl: story.thumbnailUrl,
        cyclePhase: story.cyclePhase,
        moodTag: story.moodTag,
        duration: story.duration,
        viewsCount: story.viewsCount,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        viewed: viewedSet.has(story.id),
        isOwn: uid === userId,
      });
    }

    return Array.from(userMap.values());
  }

  async createStory(userId: string, academyId: string, dto: CreateStoryDto) {
    const ttlHours =
      dto.specialType === 'achievement'
        ? 48
        : parseInt(process.env.STORY_TTL_HOURS ?? '24', 10);

    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    // Auto-detect cycle phase
    const phase = await this.getUserPhase(userId);

    const entity = this.storyRepo.create({
      userId,
      academyId,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      mediaKey: dto.mediaKey ?? null,
      cyclePhase: phase,
      moodTag: dto.moodTag ?? null,
      duration: dto.duration ?? null,
      expiresAt,
    } as any);
    return this.storyRepo.save(entity) as unknown as Story;
  }

  async registerView(storyId: string, viewerId: string) {
    const story = await this.storyRepo.findOneBy({ id: storyId });
    if (!story) throw new NotFoundException();
    // Don't count self-views
    if (story.userId === viewerId) return { viewed: true };
    const existing = await this.viewRepo.findOneBy({ storyId, viewerId });
    if (existing) return { viewed: true };
    await this.viewRepo.save(this.viewRepo.create({ storyId, viewerId }));
    await this.storyRepo.increment({ id: storyId }, 'viewsCount', 1);
    return { viewed: true };
  }

  async getViews(storyId: string, userId: string) {
    const story = await this.storyRepo.findOneBy({ id: storyId });
    if (!story) throw new NotFoundException();
    if (story.userId !== userId)
      throw new ForbiddenException(
        'Apenas o dono pode ver as visualizacoes',
      );
    return this.viewRepo.find({
      where: { storyId },
      order: { viewedAt: 'DESC' },
    });
  }

  async deleteStory(storyId: string, userId: string, role: string) {
    const story = await this.storyRepo.findOneBy({ id: storyId });
    if (!story) throw new NotFoundException();
    if (
      story.userId !== userId &&
      role !== 'admin' &&
      role !== 'tenant_admin'
    ) {
      throw new ForbiddenException('Sem permissao');
    }
    story.deletedAt = new Date();
    await this.storyRepo.save(story);
    // Delete media from R2 in background
    if (story.mediaKey) {
      this.mediaService.deleteObject(story.mediaKey).catch(() => {});
    }
    return { ok: true };
  }

  // --- Cron: cleanup expired stories ---
  async cleanupExpired() {
    const expired = await this.storyRepo
      .createQueryBuilder('s')
      .where('s.expiresAt < :now', { now: new Date() })
      .andWhere('s.deletedAt IS NULL')
      .getMany();

    let cleaned = 0;
    for (const story of expired) {
      story.deletedAt = new Date();
      await this.storyRepo.save(story);
      if (story.mediaKey) {
        await this.mediaService.deleteObject(story.mediaKey).catch(() => {});
      }
      cleaned++;
    }
    return cleaned;
  }

  private async getUserPhase(userId: string): Promise<string | null> {
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
    const diff = Math.floor(
      (today.getTime() - start.getTime()) / 86400000,
    );
    const dayIndex = diff % cycleLength;
    if (dayIndex < periodLength) return 'menstrual';
    const ovDay = cycleLength - 14;
    if (dayIndex < ovDay - 1) return 'follicular';
    if (dayIndex <= ovDay + 1) return 'ovulatory';
    return 'luteal';
  }
}
