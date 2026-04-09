import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content) private readonly repo: Repository<Content>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateContentDto) { return this.repo.save(this.repo.create(dto as any)); }
  update(id: string, dto: Partial<Content>) { return this.repo.update(id, dto as any); }
  remove(id: string) { return this.repo.delete(id); }
}
