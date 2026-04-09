import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResearchData } from './entities/research.entity';
import { CreateResearchDto } from './dto/create-research.dto';

@Injectable()
export class ResearchService {
  constructor(
    @InjectRepository(ResearchData) private readonly repo: Repository<ResearchData>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateResearchDto) { return this.repo.save(this.repo.create(dto as any)); }
  update(id: string, dto: Partial<ResearchData>) { return this.repo.update(id, dto as any); }
  remove(id: string) { return this.repo.delete(id); }
}
