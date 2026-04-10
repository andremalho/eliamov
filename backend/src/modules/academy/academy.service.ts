import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { ChallengeParticipant } from '../challenges/entities/challenge-participant.entity';

@Injectable()
export class AcademyService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Activity) private activityRepo: Repository<Activity>,
    @InjectRepository(Challenge) private challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private participantRepo: Repository<ChallengeParticipant>,
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
}
