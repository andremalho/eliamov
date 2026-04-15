import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { PaginationDto, paginate } from '../../common/pagination.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private readonly participantRepo: Repository<ChallengeParticipant>,
    @InjectRepository(Notifications)
    private readonly notifRepo: Repository<Notifications>,
  ) {}

  async findActive(tenantId: string) {
    const today = new Date().toISOString().slice(0, 10);
    return this.challengeRepo
      .createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isActive = true')
      .andWhere('c.endDate >= :today', { today })
      .orderBy('c.startDate', 'ASC')
      .getMany();
  }

  async join(challengeId: string, userId: string) {
    const challenge = await this.challengeRepo.findOneBy({ id: challengeId });
    if (!challenge) throw new NotFoundException();
    const existing = await this.participantRepo.findOneBy({
      challengeId,
      userId,
    });
    if (existing) return existing;
    const participant = this.participantRepo.create({ challengeId, userId });
    return this.participantRepo.save(participant);
  }

  async leaderboard(challengeId: string, pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.participantRepo.findAndCount({
      where: { challengeId },
      relations: ['user'],
      order: { currentProgress: 'DESC', createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const startRank = (page - 1) * limit + 1;
    const leaderboard = data.map((p, i) => ({
      rank: startRank + i,
      userId: p.userId,
      name: p.user?.name ?? 'Unknown',
      avatarUrl: (p.user as any)?.profile?.avatarUrl ?? null,
      currentProgress: p.currentProgress,
      completedAt: p.completedAt,
    }));
    return paginate(leaderboard, total, page, limit);
  }

  async getMyParticipations(userId: string, challengeIds: string[]) {
    if (challengeIds.length === 0) return [];
    return this.participantRepo.find({
      where: { userId, challengeId: In(challengeIds) },
    });
  }

  async getTeamProgress(challengeId: string) {
    const challenge = await this.challengeRepo.findOneBy({ id: challengeId });
    if (!challenge) throw new NotFoundException();
    const result = await this.participantRepo
      .createQueryBuilder('p')
      .select('SUM(p.currentProgress)', 'totalProgress')
      .addSelect('COUNT(*)', 'participantCount')
      .where('p.challengeId = :challengeId', { challengeId })
      .getRawOne();

    return {
      challengeId,
      goalMode: challenge.goalMode,
      goalValue: challenge.goalValue,
      totalProgress: Number(result?.totalProgress ?? 0),
      participantCount: Number(result?.participantCount ?? 0),
      percentComplete: Math.min(100, Math.round((Number(result?.totalProgress ?? 0) / challenge.goalValue) * 100)),
    };
  }

  async create(tenantId: string, creatorId: string, dto: CreateChallengeDto) {
    return this.challengeRepo.save(
      this.challengeRepo.create({ ...dto, tenantId, creatorId } as any),
    );
  }

  async onActivityCreated(
    userId: string,
    activity: { duration: number; startedAt: Date | string },
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const participations = await this.participantRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.challenge', 'c')
      .where('p.userId = :userId', { userId })
      .andWhere('c.isActive = true')
      .andWhere('c.startDate <= :today', { today })
      .andWhere('c.endDate >= :today', { today })
      .andWhere('p.completedAt IS NULL')
      .getMany();

    for (const p of participations) {
      const challenge = p.challenge!;
      let updated = false;

      switch (challenge.goalType) {
        case 'workout_count':
          p.currentProgress += 1;
          updated = true;
          break;
        case 'duration':
          p.currentProgress += Math.round(activity.duration / 60);
          updated = true;
          break;
        case 'streak': {
          const activityDate = new Date(activity.startedAt)
            .toISOString()
            .slice(0, 10);
          const lastDate = p.lastActivityDate
            ? new Date(p.lastActivityDate).toISOString().slice(0, 10)
            : null;
          if (activityDate === lastDate) break;
          if (lastDate) {
            const diff =
              (new Date(activityDate).getTime() -
                new Date(lastDate).getTime()) /
              86400000;
            if (diff === 1) {
              p.currentStreak += 1;
            } else if (diff > 1) {
              p.currentStreak = 1;
            }
          } else {
            p.currentStreak = 1;
          }
          p.currentProgress = p.currentStreak;
          p.lastActivityDate = activityDate as any;
          updated = true;
          break;
        }
      }

      if (!updated) continue;

      const pct = (p.currentProgress / challenge.goalValue) * 100;

      if (pct >= 50 && !p.notified50) {
        p.notified50 = true;
        await this.notifRepo.save(
          this.notifRepo.create({
            userId,
            title: `Metade do caminho! "${challenge.title}"`,
            body: `Voce ja completou ${Math.round(pct)}% do desafio. Continue assim!`,
            type: 'info',
          } as any),
        );
      }

      if (p.currentProgress >= challenge.goalValue && !p.notified100) {
        p.completedAt = new Date();
        p.notified100 = true;
        await this.notifRepo.save(
          this.notifRepo.create({
            userId,
            title: `Desafio concluido! "${challenge.title}"`,
            body: `Parabens! Voce completou o desafio com sucesso!`,
            type: 'info',
          } as any),
        );
      }

      await this.participantRepo.save(p);
    }
  }
}
