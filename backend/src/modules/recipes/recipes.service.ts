import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private recipeRepo: Repository<Recipe>,
    @InjectRepository(CycleEntry) private cycleRepo: Repository<CycleEntry>,
  ) {}

  async findAll(tenantId: string, userId: string, query: RecipeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;

    const qb = this.recipeRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.category', 'cat')
      .where('r.publishedAt IS NOT NULL')
      .andWhere('(r.academyId IS NULL OR r.academyId = :tenantId)', { tenantId })
      .orderBy('r.publishedAt', 'DESC');

    let phase = query.phase;
    if (!phase) {
      phase = await this.getUserPhase(userId);
    }
    if (phase && phase !== 'all') {
      qb.andWhere('(r.cyclePhase = :phase OR r.cyclePhase = :all)', { phase, all: 'all' });
    }

    if (query.category) {
      qb.andWhere('cat.slug = :slug', { slug: query.category });
    }

    if (query.search) {
      qb.andWhere('LOWER(r.title) LIKE :search', { search: `%${query.search.toLowerCase()}%` });
    }

    if (query.restriction) {
      qb.andWhere(':restriction = ANY(r.dietaryRestrictions)', { restriction: query.restriction });
    }

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const recipe = await this.recipeRepo.findOne({ where: { id }, relations: ['category'] });
    if (!recipe) throw new NotFoundException();
    return recipe;
  }

  create(authorId: string, dto: CreateRecipeDto) {
    return this.recipeRepo.save(this.recipeRepo.create({
      ...dto,
      authorId,
      publishedAt: new Date(),
    } as any));
  }

  async update(id: string, dto: Partial<CreateRecipeDto>) {
    const recipe = await this.recipeRepo.findOneBy({ id });
    if (!recipe) throw new NotFoundException();
    Object.assign(recipe, dto);
    return this.recipeRepo.save(recipe);
  }

  async remove(id: string) {
    const recipe = await this.recipeRepo.findOneBy({ id });
    if (!recipe) throw new NotFoundException();
    await this.recipeRepo.delete(id);
    return { ok: true };
  }

  private async getUserPhase(userId: string): Promise<string | null> {
    const entry = await this.cycleRepo.findOne({ where: { userId }, order: { startDate: 'DESC' } });
    if (!entry) return null;
    const cycleLength = entry.cycleLength ?? 28;
    const periodLength = entry.periodLength ?? 5;
    const start = new Date(entry.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    const dayIndex = diff % cycleLength;
    if (dayIndex < periodLength) return 'menstrual';
    const ovDay = cycleLength - 14;
    if (dayIndex < ovDay - 1) return 'follicular';
    if (dayIndex <= ovDay + 1) return 'ovulatory';
    return 'luteal';
  }
}
