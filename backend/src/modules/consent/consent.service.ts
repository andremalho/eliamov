import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentRecord } from './entities/consent.entity';
import { CreateConsentDto } from './dto/create-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(ConsentRecord) private readonly repo: Repository<ConsentRecord>,
  ) {}

  findAllForUser(userId: string) {
    return this.repo.find({ where: { userId } });
  }

  async findOneForUser(userId: string, id: string) {
    const record = await this.repo.findOne({ where: { id, userId } });
    if (!record) throw new NotFoundException();
    return record;
  }

  createForUser(userId: string, dto: CreateConsentDto) {
    return this.repo.save(this.repo.create({
      ...dto,
      userId,
      grantedAt: dto.granted ? new Date() : null,
    } as any));
  }

  async updateForUser(userId: string, id: string, dto: Partial<ConsentRecord>) {
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

  async hasConsent(userId: string, consentType: string): Promise<boolean> {
    const record = await this.repo.findOne({
      where: { userId, consentType: consentType as any, granted: true },
    });
    return !!record;
  }
}
