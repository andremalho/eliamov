import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { ChallengeParticipant } from '../challenges/entities/challenge-participant.entity';
import { Article } from '../content/entities/article.entity';
import { ContentCategory } from '../content/entities/content-category.entity';
import { SEED_ARTICLES, SEED_CATEGORIES } from '../../seeds/content-seed';
import { SEED_RECIPES } from '../../seeds/recipe-seed';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Activity) private activityRepo: Repository<Activity>,
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private participantRepo: Repository<ChallengeParticipant>,
    @InjectRepository(Article) private articleRepo: Repository<Article>,
    @InjectRepository(ContentCategory) private categoryRepo: Repository<ContentCategory>,
    @InjectRepository(Recipe) private recipeRepo: Repository<Recipe>,
  ) {}

  async getOverview(academyId: string) {
    // Active members this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const totalMembers = await this.userRepo.count({
      where: { tenantId: academyId },
    });

    // Workouts this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const workoutsThisWeek = await this.activityRepo
      .createQueryBuilder('a')
      .innerJoin(User, 'u', 'u.id = a."userId"')
      .where('u."tenantId" = :academyId', { academyId })
      .andWhere('a."startedAt" >= :weekStart', { weekStart })
      .getCount();

    // Active challenges
    const today = new Date().toISOString().slice(0, 10);
    const activeChallenges = await this.challengeRepo
      .createQueryBuilder('c')
      .where('c."tenantId" = :academyId', { academyId })
      .andWhere('c."isActive" = true')
      .andWhere('c."endDate" >= :today', { today })
      .getCount();

    // Challenge participants
    const challengeParticipants = await this.participantRepo
      .createQueryBuilder('p')
      .innerJoin(Challenge, 'c', 'c.id = p."challengeId"')
      .where('c."tenantId" = :academyId', { academyId })
      .andWhere('c."isActive" = true')
      .getCount();

    // Average frequency (workouts per member this week)
    const avgFrequency =
      totalMembers > 0 ? +(workoutsThisWeek / totalMembers).toFixed(1) : 0;

    return {
      totalMembers,
      workoutsThisWeek,
      avgFrequency,
      activeChallenges,
      challengeParticipants,
    };
  }

  async getAdminDashboard(tenantId: string) {
    const totalUsers = await this.userRepo.count({ where: { tenantId } });

    // Users by role
    const usersByRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('u.tenantId = :tenantId', { tenantId })
      .groupBy('u.role')
      .getRawMany();

    // Users by fitness goal
    const usersByGoal = await this.userRepo
      .createQueryBuilder('u')
      .select('u.fitnessGoal', 'goal')
      .addSelect('COUNT(*)', 'count')
      .where('u.tenantId = :tenantId', { tenantId })
      .andWhere('u.fitnessGoal IS NOT NULL')
      .groupBy('u.fitnessGoal')
      .getRawMany();

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = await this.userRepo
      .createQueryBuilder('u')
      .where('u.tenantId = :tenantId', { tenantId })
      .andWhere('u.createdAt >= :since', { since: thirtyDaysAgo })
      .getCount();

    const overview = await this.getOverview(tenantId);

    return { ...overview, totalUsers, usersByRole, usersByGoal, recentSignups };
  }

  // Search across all data
  async globalSearch(tenantId: string, query: string) {
    const q = `%${query.toLowerCase()}%`;

    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.tenantId = :tenantId', { tenantId })
      .andWhere('(LOWER(u.name) LIKE :q OR LOWER(u.email) LIKE :q)', { q })
      .select(['u.id', 'u.name', 'u.email', 'u.role', 'u.createdAt'])
      .take(10)
      .getMany();

    return { users };
  }

  async exportUsersCsv(tenantId: string): Promise<string> {
    const users = await this.userRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'role', 'gender', 'birthDate', 'weight', 'height', 'fitnessLevel', 'fitnessGoal', 'isProfileComplete', 'createdAt'],
    });

    const header = 'id,nome,email,papel,genero,nascimento,peso_kg,altura_cm,nivel,objetivo,perfil_completo,criado_em';
    const rows = users.map((u) =>
      [
        u.id,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        u.email,
        u.role,
        u.gender || '',
        u.birthDate ? new Date(u.birthDate).toISOString().slice(0, 10) : '',
        u.weight ?? '',
        u.height ?? '',
        u.fitnessLevel || '',
        u.fitnessGoal || '',
        u.isProfileComplete ? 'sim' : 'nao',
        new Date(u.createdAt).toISOString(),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }

  async exportContentCsv(tenantId: string): Promise<string> {
    const articles = await this.articleRepo.find({
      where: [{ academyId: tenantId }, { academyId: undefined as any }],
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    const header = 'id,titulo,categoria,fase_ciclo,publicado_em,criado_em';
    const rows = articles.map((a) =>
      [
        a.id,
        `"${(a.title || '').replace(/"/g, '""')}"`,
        a.category?.name || '',
        a.cyclePhase,
        a.publishedAt ? new Date(a.publishedAt).toISOString() : '',
        new Date(a.createdAt).toISOString(),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }

  async seedContent(tenantId: string) {
    let categoriesCreated = 0;
    let articlesCreated = 0;

    // Create categories if they don't exist
    const categoryMap = new Map<string, string>();
    for (const cat of SEED_CATEGORIES) {
      let existing = await this.categoryRepo.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        existing = await this.categoryRepo.save(this.categoryRepo.create(cat));
        categoriesCreated++;
      }
      categoryMap.set(cat.slug, existing.id);
    }

    // Create articles
    for (const article of SEED_ARTICLES) {
      const exists = await this.articleRepo.findOne({
        where: { title: article.title, academyId: tenantId },
      });
      if (!exists) {
        const categoryId = categoryMap.get(article.categorySlug) ?? null;
        await this.articleRepo.save(
          this.articleRepo.create({
            title: article.title,
            summary: article.summary,
            body: article.body,
            cyclePhase: article.cyclePhase as any,
            categoryId,
            authorId: tenantId,
            academyId: tenantId,
            publishedAt: new Date(),
          }),
        );
        articlesCreated++;
      }
    }

    // Create recipes
    let recipesCreated = 0;
    for (const recipe of SEED_RECIPES) {
      const exists = await this.recipeRepo.findOne({
        where: { title: recipe.title, academyId: tenantId },
      });
      if (!exists) {
        const categoryId = categoryMap.get(recipe.categorySlug) ?? null;
        await this.recipeRepo.save(
          this.recipeRepo.create({
            title: recipe.title,
            summary: recipe.summary,
            instructions: recipe.instructions,
            ingredients: recipe.ingredients,
            macros: recipe.macros,
            prepTimeMinutes: recipe.prepTimeMinutes,
            cookTimeMinutes: recipe.cookTimeMinutes,
            servings: recipe.servings,
            dietaryRestrictions: recipe.dietaryRestrictions,
            cyclePhase: recipe.cyclePhase as any,
            categoryId,
            authorId: tenantId,
            academyId: tenantId,
            publishedAt: new Date(),
          }),
        );
        recipesCreated++;
      }
    }

    return { categoriesCreated, articlesCreated, recipesCreated };
  }
}
