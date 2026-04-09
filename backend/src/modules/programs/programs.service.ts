import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WellnessProgram } from './entities/programs.entity';
import { ProgramEnrollment } from './entities/program-enrollment.entity';
import { CreateProgramsDto } from './dto/create-programs.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(WellnessProgram) private readonly repo: Repository<WellnessProgram>,
    @InjectRepository(ProgramEnrollment) private readonly enrollmentRepo: Repository<ProgramEnrollment>,
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

  // ── Enrollment methods ──────────────────────────────────────────

  async enroll(userId: string, programId: string) {
    const existing = await this.enrollmentRepo.findOne({
      where: { userId, programId, status: 'active' },
    });
    if (existing) {
      throw new ConflictException('Você já está inscrita neste programa.');
    }

    const program = await this.repo.findOne({ where: { id: programId } });
    if (!program) throw new NotFoundException('Programa não encontrado.');

    const enrollment = this.enrollmentRepo.create({ userId, programId });
    return this.enrollmentRepo.save(enrollment);
  }

  getMyEnrollments(userId: string) {
    return this.enrollmentRepo.find({
      where: { userId },
      relations: ['program'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateProgress(userId: string, enrollmentId: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, userId },
    });
    if (!enrollment) throw new NotFoundException('Inscrição não encontrada.');

    if (dto.currentWeek !== undefined) enrollment.currentWeek = dto.currentWeek;
    if (dto.progress !== undefined) enrollment.progress = dto.progress;

    // Auto-complete when currentWeek exceeds program duration
    if (enrollment.currentWeek > 0 && enrollment.program) {
      const program = await this.repo.findOne({ where: { id: enrollment.programId } });
      if (program && enrollment.currentWeek > program.durationWeeks) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
    }

    return this.enrollmentRepo.save(enrollment);
  }

  async abandonEnrollment(userId: string, enrollmentId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, userId },
    });
    if (!enrollment) throw new NotFoundException('Inscrição não encontrada.');

    enrollment.status = 'abandoned';
    return this.enrollmentRepo.save(enrollment);
  }
}
