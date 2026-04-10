import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TrainerStudentLink } from './entities/trainer-student-link.entity';
import { FamilyLink } from './entities/family-link.entity';
import { Notifications } from '../notifications/entities/notifications.entity';
import { InviteStudentDto } from './dto/invite-student.dto';
import { InviteCompanionDto } from './dto/invite-companion.dto';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(TrainerStudentLink)
    private readonly trainerStudentRepo: Repository<TrainerStudentLink>,
    @InjectRepository(FamilyLink)
    private readonly familyLinkRepo: Repository<FamilyLink>,
    @InjectRepository(Notifications)
    private readonly notificationsRepo: Repository<Notifications>,
  ) {}

  async inviteStudent(trainerId: string, dto: InviteStudentDto) {
    const student = await this.usersRepo.findOne({
      where: { email: dto.studentEmail },
    });
    if (!student) throw new NotFoundException('Aluna não encontrada');

    const link = this.trainerStudentRepo.create({
      trainerId,
      studentId: student.id,
      academyId: dto.academyId,
      permissions: dto.permissions ?? {
        viewWorkouts: true,
        viewProgress: true,
        viewCycleData: false,
      },
      status: 'pending',
    });
    await this.trainerStudentRepo.save(link);

    const notification = this.notificationsRepo.create({
      userId: student.id,
      title: 'Convite de Personal Trainer',
      body: 'Você recebeu um convite para ser acompanhada por um personal trainer.',
      type: 'info',
    });
    await this.notificationsRepo.save(notification);

    return link;
  }

  async acceptStudentInvite(studentId: string, linkId: string) {
    const link = await this.trainerStudentRepo.findOne({
      where: { id: linkId },
    });
    if (!link) throw new NotFoundException('Convite não encontrado');
    if (link.studentId !== studentId) {
      throw new ForbiddenException('Este convite não pertence a esta aluna');
    }

    link.status = 'active';
    link.acceptedAt = new Date();
    return this.trainerStudentRepo.save(link);
  }

  async getMyStudents(trainerId: string) {
    return this.trainerStudentRepo.find({
      where: { trainerId, status: 'active' },
      relations: ['student'],
    });
  }

  async inviteCompanion(memberId: string, dto: InviteCompanionDto) {
    const companion = await this.usersRepo.findOne({
      where: { email: dto.companionEmail },
    });
    if (!companion)
      throw new NotFoundException('Acompanhante não encontrado(a)');

    const link = this.familyLinkRepo.create({
      companionId: companion.id,
      memberId,
      permissions: dto.permissions ?? {
        viewWorkouts: true,
        viewGoals: true,
        viewFeed: false,
      },
      status: 'pending',
    });
    await this.familyLinkRepo.save(link);

    const notification = this.notificationsRepo.create({
      userId: companion.id,
      title: 'Convite de Acompanhamento Familiar',
      body: 'Você recebeu um convite para acompanhar um membro da família.',
      type: 'info',
    });
    await this.notificationsRepo.save(notification);

    return link;
  }

  async acceptCompanionInvite(companionId: string, linkId: string) {
    const link = await this.familyLinkRepo.findOne({
      where: { id: linkId },
    });
    if (!link) throw new NotFoundException('Convite não encontrado');
    if (link.companionId !== companionId) {
      throw new ForbiddenException(
        'Este convite não pertence a este acompanhante',
      );
    }

    link.status = 'active';
    link.acceptedAt = new Date();
    return this.familyLinkRepo.save(link);
  }

  async getMyMember(companionId: string) {
    const link = await this.familyLinkRepo.findOne({
      where: { companionId, status: 'active' },
      relations: ['member'],
    });
    if (!link) throw new NotFoundException('Nenhum vínculo ativo encontrado');

    const member = link.member;
    if (!member) throw new NotFoundException('Membro não encontrado');

    const { password, ...safe } = member;
    const filtered: Record<string, any> = { id: safe.id, name: safe.name };

    if (link.permissions.viewWorkouts) {
      filtered.fitnessLevel = safe.fitnessLevel;
      filtered.fitnessGoal = safe.fitnessGoal;
    }
    if (link.permissions.viewGoals) {
      filtered.profile = safe.profile;
    }

    return { link, member: filtered };
  }
}
