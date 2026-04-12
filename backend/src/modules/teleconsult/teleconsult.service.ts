import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeleconsultSession } from './entities/teleconsult.entity';
import { CreateTeleconsultDto } from './dto/create-teleconsult.dto';

@Injectable()
export class TeleconsultService {
  constructor(
    @InjectRepository(TeleconsultSession) private readonly repo: Repository<TeleconsultSession>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { scheduledAt: 'DESC' } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateTeleconsultDto) {
    return this.repo.save(this.repo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<TeleconsultSession>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }

  async createVideoRoom(userId: string, sessionId: string) {
    const session = await this.repo.findOneBy({ id: sessionId, userId });
    if (!session) throw new NotFoundException();

    // Generate a simple room ID (in production, integrate with Twilio/Daily.co/Jitsi)
    const roomId = `eliamov-${sessionId.slice(0, 8)}-${Date.now()}`;
    const roomUrl = `https://meet.jit.si/${roomId}`; // Free Jitsi integration

    session.meetingUrl = roomUrl;
    session.status = 'in_progress';
    await this.repo.save(session);

    return { roomId, roomUrl, sessionId };
  }
}
