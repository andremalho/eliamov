import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService implements OnModuleInit {
  constructor(
    @InjectRepository(Tenant) private readonly repo: Repository<Tenant>,
  ) {}

  async onModuleInit() {
    const existing = await this.repo.findOne({ where: { slug: 'demo' } });
    if (!existing) {
      await this.repo.save(
        this.repo.create({
          name: 'EliaMov Demo',
          slug: 'demo',
          primaryColor: '#7C3AED',
          isActive: true,
        }),
      );
    }
  }

  findDefault() {
    return this.repo.findOne({ where: { slug: 'demo' } });
  }

  findAll() {
    return this.repo.find();
  }
  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  create(dto: CreateTenantDto) {
    return this.repo.save(this.repo.create(dto));
  }
  update(id: string, dto: Partial<Tenant>) {
    return this.repo.update(id, dto);
  }
  remove(id: string) {
    return this.repo.delete(id);
  }

  findBySlug(slug: string) {
    return this.repo.findOne({ where: { slug } });
  }
}
