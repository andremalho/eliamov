import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notifications } from './entities/notifications.entity';
import { User } from '../users/entities/user.entity';
import { CycleEntry } from '../cycle/entities/cycle.entity';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    @InjectRepository(Notifications) private notifRepo: Repository<Notifications>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CycleEntry) private cycleRepo: Repository<CycleEntry>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyNotifications() {
    this.logger.log('Sending daily notifications...');
    const users = await this.userRepo.find();
    let count = 0;

    for (const user of users) {
      try {
        // Cycle phase notification
        const entry = await this.cycleRepo.findOne({ where: { userId: user.id }, order: { startDate: 'DESC' } });
        if (entry) {
          const cycleLen = entry.cycleLength ?? 28;
          const periodLen = entry.periodLength ?? 5;
          const start = new Date(entry.startDate);
          const today = new Date();
          start.setHours(0,0,0,0); today.setHours(0,0,0,0);
          const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
          const dayIndex = diff % cycleLen;
          const daysToNextPeriod = cycleLen - dayIndex;

          // Period prediction (2 days before)
          if (daysToNextPeriod === 2) {
            await this.createNotif(user.id, 'Menstruacao prevista em 2 dias', 'Prepare-se. Ajuste seus treinos para exercicios leves.', 'reminder');
            count++;
          }

          // Phase change notifications
          if (dayIndex === periodLen) {
            await this.createNotif(user.id, 'Fase folicular iniciou!', 'Energia crescente. Otimo momento para treinos de forca e HIIT.', 'info');
            count++;
          }
          if (dayIndex === cycleLen - 14 - 1) {
            await this.createNotif(user.id, 'Fase ovulatoria', 'Pico de energia! Cuidado com risco ligamentar - aquecimento prolongado.', 'warning');
            count++;
          }
          if (dayIndex === cycleLen - 14 + 2) {
            await this.createNotif(user.id, 'Fase lutea iniciou', 'Energia pode diminuir. Prefira pilates e treinos moderados.', 'info');
            count++;
          }
        }

        // Daily training reminder (if no activity today - simplified: just send to ~half the users daily)
        // In production, check if user already trained today
        if (Math.random() > 0.5) {
          await this.createNotif(user.id, 'Hora do treino!', 'Seu corpo agradece cada movimento. Veja o treino de hoje.', 'reminder');
          count++;
        }
      } catch { /* skip user on error */ }
    }

    this.logger.log(`Sent ${count} notifications`);
  }

  private async createNotif(userId: string, title: string, body: string, type: 'info' | 'warning' | 'reminder') {
    // Check if same notification already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await this.notifRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('n.title = :title', { title })
      .andWhere('n.createdAt >= :today', { today })
      .getCount();
    if (existing > 0) return;

    await this.notifRepo.save(this.notifRepo.create({ userId, title, body, type } as any));
  }
}
