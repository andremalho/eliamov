import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CycleService } from '../cycle/cycle.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private recipeRepo: Repository<Recipe>,
    private readonly cycleService: CycleService,
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
      phase = await this.cycleService.getUserPhaseString(userId);
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
    } as Partial<Recipe>));
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
}
