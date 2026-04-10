import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CycleEntry } from '../cycle/entities/cycle.entity';
import { User } from '../users/entities/user.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { ActivityPost } from '../feed/entities/activity-post.entity';
import { GroupWorkout } from './entities/group-workout.entity';
import { CreateGroupWorkoutDto } from './dto/create-group-workout.dto';

@Injectable()
export class CycleGroupService {
  constructor(
    @InjectRepository(CycleEntry)
    private cycleRepo: Repository<CycleEntry>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(GroupWorkout)
    private workoutRepo: Repository<GroupWorkout>,
    @InjectRepository(Notifications)
    private notifRepo: Repository<Notifications>,
    @InjectRepository(ActivityPost)
    private feedPostRepo: Repository<ActivityPost>,
  ) {}

  async getPeers(userId: string, tenantId: string) {
    const computePhase = (
      dayIndex: number,
      cycleLength: number,
      periodLength: number,
    ): string => {
      if (dayIndex < periodLength) return 'menstrual';
      const ovulationDay = cycleLength - 14;
      if (dayIndex < ovulationDay - 1) return 'follicular';
      if (dayIndex <= ovulationDay + 1) return 'ovulatory';
      return 'luteal';
    };

    const getUserPhase = (entry: CycleEntry): string => {
      const cycleLength = entry.cycleLength ?? 28;
      const periodLength = entry.periodLength ?? 5;
      const start = new Date(entry.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const dayOfCycle = diffDays % cycleLength;
      return computePhase(dayOfCycle, cycleLength, periodLength);
    };

    // Get current user's latest cycle entry
    const myEntry = await this.cycleRepo.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });
    if (!myEntry) return { phase: null, peers: [], count: 0 };

    const myPhase = getUserPhase(myEntry);

    // Get all tenant users (except current user)
    const tenantUsers = await this.userRepo.find({ where: { tenantId } });
    const otherUsers = tenantUsers.filter((u) => u.id !== userId);

    // Find peers in the same phase
    const peers: { id: string; name: string; avatarUrl: string | null }[] = [];
    for (const user of otherUsers) {
      const entry = await this.cycleRepo.findOne({
        where: { userId: user.id },
        order: { startDate: 'DESC' },
      });
      if (!entry) continue;
      const phase = getUserPhase(entry);
      if (phase === myPhase) {
        peers.push({
          id: user.id,
          name: user.name,
          avatarUrl: user.profile?.avatarUrl ?? null,
        });
      }
    }

    // If 3+ people total (2 peers + current user), send notification
    if (peers.length >= 2) {
      await this.notifyPeers(userId, peers, myPhase);
    }

    return { phase: myPhase, peers, count: peers.length };
  }

  private async notifyPeers(
    userId: string,
    peers: { id: string; name: string; avatarUrl: string | null }[],
    phase: string,
  ) {
    const phaseLabels: Record<string, string> = {
      menstrual: 'menstrual',
      follicular: 'folicular',
      ovulatory: 'ovulatoria',
      luteal: 'lutea',
    };
    const total = peers.length + 1;
    const title = `${total} mulheres na fase ${phaseLabels[phase] ?? phase} hoje`;
    const body = `Voce e mais ${peers.length} colegas de academia estao na mesma fase. Que tal treinar juntas?`;

    // Check if notification was already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.notifRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('n.title = :title', { title })
      .andWhere('n.createdAt >= :today', { today })
      .getOne();

    if (!existing) {
      await this.notifRepo.save(
        this.notifRepo.create({
          userId,
          title,
          body,
          type: 'info' as const,
        }),
      );
    }
  }

  async createGroupWorkout(
    userId: string,
    tenantId: string,
    dto: CreateGroupWorkoutDto,
  ) {
    // Get current phase
    const myEntry = await this.cycleRepo.findOne({
      where: { userId },
      order: { startDate: 'DESC' },
    });
    const phase = myEntry
      ? this.computePhaseForEntry(myEntry)
      : 'follicular';

    const participantIds = dto.participantIds ?? [];
    if (!participantIds.includes(userId)) participantIds.unshift(userId);

    // Create feed post for the group workout
    const feedPost = this.feedPostRepo.create({
      userId,
      tenantId,
      content: `Treino em grupo: ${dto.title} | Fase ${phase} | ${participantIds.length} participantes`,
    });
    const savedPost = await this.feedPostRepo.save(feedPost);

    const workout = this.workoutRepo.create({
      creatorId: userId,
      tenantId,
      title: dto.title,
      description: dto.description ?? null,
      phase,
      participantIds,
      feedPostId: savedPost.id,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    return this.workoutRepo.save(workout);
  }

  private computePhaseForEntry(entry: CycleEntry): string {
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
