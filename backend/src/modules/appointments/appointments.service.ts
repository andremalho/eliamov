import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentsDto } from './dto/create-appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly repo: Repository<Appointment>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { scheduledAt: 'DESC' } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateAppointmentsDto) {
    return this.repo.save(this.repo.create({ ...dto, userId } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<Appointment>) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return this.repo.update(id, dto as any);
  }

  async removeForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
