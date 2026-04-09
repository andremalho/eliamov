import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WellnessProgram } from './entities/programs.entity';
import { CreateProgramsDto } from './dto/create-programs.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(WellnessProgram) private readonly repo: Repository<WellnessProgram>,
  ) {}

  findAllPublished() {
    return this.repo.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const program = await this.repo.findOne({ where: { id } });
    if (!program) throw new NotFoundException();
    return program;
  }

  create(dto: CreateProgramsDto) {
    return this.repo.save(this.repo.create(dto as any));
  }

  async update(id: string, dto: Partial<WellnessProgram>) {
    const program = await this.repo.findOne({ where: { id } });
    if (!program) throw new NotFoundException();
    Object.assign(program, dto);
    return this.repo.save(program);
  }

  async remove(id: string) {
    const program = await this.repo.findOne({ where: { id } });
    if (!program) throw new NotFoundException();
    await this.repo.delete(id);
    return { ok: true };
  }
}
