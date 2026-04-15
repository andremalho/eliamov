import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>,
  ) {}

  log(data: Partial<AuditLog>) {
    return this.repo.save(this.repo.create(data));
  }

  async findAll(tenantId: string, page = 1, limit = 30) {
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByUser(userId: string, page = 1, limit = 30) {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
