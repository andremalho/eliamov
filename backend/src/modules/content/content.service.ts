import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { Video } from './entities/video.entity';
import { ContentCategory } from './entities/content-category.entity';
import { UserSavedContent } from './entities/user-saved-content.entity';
import { CycleService } from '../cycle/cycle.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { SaveContentDto } from './dto/save-content.dto';
import { ContentQueryDto } from './dto/content-query.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Article) private articleRepo: Repository<Article>,
    @InjectRepository(Video) private videoRepo: Repository<Video>,
    @InjectRepository(ContentCategory) private categoryRepo: Repository<ContentCategory>,
    @InjectRepository(UserSavedContent) private savedRepo: Repository<UserSavedContent>,
    private readonly cycleService: CycleService,
  ) {}

  // --- Articles ---
  async findArticles(tenantId: string, userId: string, query: ContentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;

    const qb = this.articleRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.category', 'cat')
      .where('a.publishedAt IS NOT NULL')
      .andWhere('(a.academyId IS NULL OR a.academyId = :tenantId)', { tenantId })
      .orderBy('a.publishedAt', 'DESC');

    // Filter by phase
    let phase = query.phase;
    if (!phase) {
      phase = await this.cycleService.getUserPhaseString(userId);
    }
    if (phase && phase !== 'all') {
      qb.andWhere('(a.cyclePhase = :phase OR a.cyclePhase = :all)', { phase, all: 'all' });
    }

    // Filter by category slug
    if (query.category) {
      qb.andWhere('cat.slug = :slug', { slug: query.category });
    }

    // Search
    if (query.search) {
      qb.andWhere('LOWER(a.title) LIKE :search', { search: `%${query.search.toLowerCase()}%` });
    }

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findArticleById(id: string) {
    const article = await this.articleRepo.findOne({ where: { id }, relations: ['category'] });
    if (!article) throw new NotFoundException();
    return article;
  }

  createArticle(authorId: string, dto: CreateArticleDto) {
    return this.articleRepo.save(this.articleRepo.create({
      ...dto,
      authorId,
      publishedAt: new Date(),
    } as any));
  }

  // --- Videos ---
  async findVideos(tenantId: string, userId: string, query: ContentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;

    const qb = this.videoRepo.createQueryBuilder('v')
      .leftJoinAndSelect('v.category', 'cat')
      .where('v.publishedAt IS NOT NULL')
      .andWhere('(v.academyId IS NULL OR v.academyId = :tenantId)', { tenantId })
      .orderBy('v.publishedAt', 'DESC');

    let phase = query.phase;
    if (!phase) phase = await this.cycleService.getUserPhaseString(userId);
    if (phase && phase !== 'all') {
      qb.andWhere('(v.cyclePhase = :phase OR v.cyclePhase = :all)', { phase, all: 'all' });
    }
    if (query.category) qb.andWhere('cat.slug = :slug', { slug: query.category });
    if (query.search) qb.andWhere('LOWER(v.title) LIKE :search', { search: `%${query.search.toLowerCase()}%` });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findVideoById(id: string) {
    const video = await this.videoRepo.findOne({ where: { id }, relations: ['category'] });
    if (!video) throw new NotFoundException();
    return video;
  }

  createVideo(dto: CreateVideoDto) {
    return this.videoRepo.save(this.videoRepo.create({ ...dto, publishedAt: new Date() } as any));
  }

  // --- Categories ---
  findCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  // --- Saved content ---
  async saveContent(userId: string, dto: SaveContentDto) {
    const existing = await this.savedRepo.findOneBy({ userId, contentType: dto.contentType, contentId: dto.contentId });
    if (existing) return existing;
    return this.savedRepo.save(this.savedRepo.create({ ...dto, userId }));
  }

  async removeSavedContent(userId: string, id: string) {
    const record = await this.savedRepo.findOneBy({ id, userId });
    if (!record) throw new NotFoundException();
    await this.savedRepo.delete(id);
    return { ok: true };
  }

  async getSavedContent(userId: string) {
    const saved = await this.savedRepo.find({ where: { userId }, order: { savedAt: 'DESC' } });
    // Hydrate with actual content
    const result = [];
    for (const s of saved) {
      if (s.contentType === 'article') {
        const article = await this.articleRepo.findOne({ where: { id: s.contentId }, relations: ['category'] });
        if (article) result.push({ ...s, content: article });
      } else {
        const video = await this.videoRepo.findOne({ where: { id: s.contentId }, relations: ['category'] });
        if (video) result.push({ ...s, content: video });
      }
    }
    return result;
  }

}
