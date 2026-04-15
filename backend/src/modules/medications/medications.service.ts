import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationEntity } from './entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(MedicationEntity) private readonly repo: Repository<MedicationEntity>,
  ) {}

  async create(userId: string, dto: CreateMedicationDto): Promise<MedicationEntity> {
    return this.repo.save(this.repo.create({ ...dto, userId, active: true } as Partial<MedicationEntity>));
  }

  async findAllActive(userId: string): Promise<MedicationEntity[]> {
    return this.repo.find({ where: { userId, active: true }, order: { startDate: 'DESC' } });
  }

  async findAll(userId: string): Promise<MedicationEntity[]> {
    return this.repo.find({ where: { userId }, order: { active: 'DESC', startDate: 'DESC' } });
  }

  async update(userId: string, id: string, dto: UpdateMedicationDto): Promise<MedicationEntity> {
    const entity = await this.repo.findOne({ where: { id, userId } });
    if (!entity) throw new NotFoundException('Medicacao nao encontrada.');
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async discontinue(userId: string, id: string): Promise<MedicationEntity> {
    const entity = await this.repo.findOne({ where: { id, userId } });
    if (!entity) throw new NotFoundException('Medicacao nao encontrada.');
    entity.active = false;
    entity.endDate = new Date().toISOString().split('T')[0];
    return this.repo.save(entity);
  }
}
