import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStats } from './entities/user-stats.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserStats) private statsRepo: Repository<UserStats>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getStats(userId: string): Promise<UserStats> {
    let stats = await this.statsRepo.findOneBy({ userId });
    if (!stats) {
      stats = (await this.statsRepo.save(
        this.statsRepo.create({ userId } as any),
      )) as unknown as UserStats;
    }
    return stats;
  }

  async addXP(userId: string, amount: number, action: string) {
    const stats = await this.getStats(userId);
    stats.xp += amount;

    // Level up every 500 XP
    const newLevel = Math.floor(stats.xp / 500) + 1;
    const leveledUp = newLevel > stats.level;
    stats.level = newLevel;

    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    const lastActive = stats.lastActiveDate
      ? new Date(stats.lastActiveDate).toISOString().slice(0, 10)
      : null;

    if (lastActive !== today) {
      if (lastActive) {
        const diff =
          (new Date(today).getTime() - new Date(lastActive).getTime()) /
          86400000;
        if (diff === 1) {
          stats.currentStreak += 1;
        } else if (diff > 1) {
          stats.currentStreak = 1;
        }
      } else {
        stats.currentStreak = 1;
      }
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
      stats.lastActiveDate = today as any;
    }

    // Update counters
    if (action === 'workout') stats.totalWorkouts += 1;
    if (action === 'checkin') stats.totalCheckins += 1;
    if (action === 'post') stats.totalPosts += 1;

    // Check badges
    const newBadges: string[] = [];
    if (stats.totalWorkouts >= 1 && !stats.badges.includes('first_workout')) {
      stats.badges.push('first_workout');
      newBadges.push('first_workout');
    }
    if (stats.totalWorkouts >= 10 && !stats.badges.includes('10_workouts')) {
      stats.badges.push('10_workouts');
      newBadges.push('10_workouts');
    }
    if (stats.totalWorkouts >= 50 && !stats.badges.includes('50_workouts')) {
      stats.badges.push('50_workouts');
      newBadges.push('50_workouts');
    }
    if (stats.currentStreak >= 7 && !stats.badges.includes('7_day_streak')) {
      stats.badges.push('7_day_streak');
      newBadges.push('7_day_streak');
    }
    if (stats.currentStreak >= 30 && !stats.badges.includes('30_day_streak')) {
      stats.badges.push('30_day_streak');
      newBadges.push('30_day_streak');
    }
    if (stats.level >= 5 && !stats.badges.includes('level_5')) {
      stats.badges.push('level_5');
      newBadges.push('level_5');
    }
    if (stats.level >= 10 && !stats.badges.includes('level_10')) {
      stats.badges.push('level_10');
      newBadges.push('level_10');
    }

    await this.statsRepo.save(stats);

    return { stats, leveledUp, newBadges, xpGained: amount };
  }

  async getLeaderboard(tenantId: string) {
    const stats = await this.statsRepo.find({
      order: { xp: 'DESC' },
      take: 20,
    });

    const entries = [];
    for (const s of stats) {
      const user = await this.userRepo.findOne({
        where: { id: s.userId },
        select: ['id', 'name', 'profile'],
      });
      if (user) {
        entries.push({
          id: user.id,
          name: user.name,
          xp: s.xp,
          level: s.level,
          currentStreak: s.currentStreak,
          totalWorkouts: s.totalWorkouts,
          badges: s.badges,
          profile: user.profile,
        });
      }
    }
    return entries;
  }
}
