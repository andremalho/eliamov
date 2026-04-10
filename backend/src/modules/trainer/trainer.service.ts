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
import { TrainerPrescription } from './entities/trainer-prescription.entity';
import { TrainerComment } from './entities/trainer-comment.entity';
import { Activity } from '../activities/entities/activity.entity';
import { WeightEntry } from '../nutrition/entities/weight-entry.entity';
import { InviteStudentDto } from './dto/invite-student.dto';
import { InviteCompanionDto } from './dto/invite-companion.dto';
import { PrescribeWorkoutDto } from './dto/prescribe-workout.dto';
import { TrainerCommentDto } from './dto/trainer-comment.dto';

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
    @InjectRepository(TrainerPrescription)
    private readonly prescriptionRepo: Repository<TrainerPrescription>,
    @InjectRepository(TrainerComment)
    private readonly trainerCommentRepo: Repository<TrainerComment>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(WeightEntry)
    private readonly weightRepo: Repository<WeightEntry>,
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

  // --- Dashboard ---

  async getDashboard(trainerId: string) {
    const links = await this.trainerStudentRepo.find({
      where: { trainerId, status: 'active' },
      relations: ['student'],
    });

    const studentIds = links.map((l) => l.studentId);
    const totalStudents = studentIds.length;

    // Workouts prescribed this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const prescriptionsThisWeek = await this.prescriptionRepo
      .createQueryBuilder('p')
      .where('p.trainerId = :trainerId', { trainerId })
      .andWhere('p.createdAt >= :weekStart', { weekStart })
      .getCount();

    // Active students today (had activity today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let activeToday = 0;
    if (studentIds.length > 0) {
      activeToday = await this.activityRepo
        .createQueryBuilder('a')
        .where('a.userId IN (:...ids)', { ids: studentIds })
        .andWhere('a.startedAt >= :today', { today })
        .select('COUNT(DISTINCT a.userId)', 'count')
        .getRawOne()
        .then((r) => parseInt(r?.count ?? '0'));
    }

    const students = links.map((l) => ({
      id: l.studentId,
      name: l.student?.name ?? 'Unknown',
      avatarUrl: (l.student?.profile as any)?.avatarUrl ?? null,
      permissions: l.permissions,
    }));

    return { totalStudents, prescriptionsThisWeek, activeToday, students };
  }

  async getStudentWorkouts(
    trainerId: string,
    studentId: string,
    link: TrainerStudentLink,
  ) {
    if (!link.permissions.viewWorkouts) {
      throw new ForbiddenException(
        'Permissao para ver treinos nao concedida',
      );
    }
    return this.activityRepo.find({
      where: { userId: studentId },
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async getStudentProgress(
    trainerId: string,
    studentId: string,
    link: TrainerStudentLink,
  ) {
    if (!link.permissions.viewProgress) {
      throw new ForbiddenException(
        'Permissao para ver progresso nao concedida',
      );
    }
    const user = await this.usersRepo.findOneBy({ id: studentId });
    const weights = await this.weightRepo.find({
      where: { userId: studentId },
      order: { date: 'DESC' },
      take: 30,
    });
    return {
      currentWeight: user?.weight ?? null,
      currentHeight: user?.height ?? null,
      fitnessLevel: user?.fitnessLevel ?? null,
      fitnessGoal: user?.fitnessGoal ?? null,
      weightHistory: weights,
    };
  }

  async prescribeWorkout(
    trainerId: string,
    studentId: string,
    dto: PrescribeWorkoutDto,
  ) {
    const prescription = await this.prescriptionRepo.save(
      this.prescriptionRepo.create({
        trainerId,
        studentId,
        title: dto.title,
        notes: dto.notes ?? null,
        workoutPlan: dto.workoutPlan ?? null,
        scheduledDates: dto.scheduledDates ?? null,
      } as any),
    );

    await this.notificationsRepo.save(
      this.notificationsRepo.create({
        userId: studentId,
        title: 'Novo treino prescrito',
        body: `Seu personal prescreveu: ${dto.title}`,
        type: 'info',
      } as any),
    );

    return prescription;
  }

  async getMyPrescriptions(trainerId: string) {
    return this.prescriptionRepo.find({
      where: { trainerId },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async commentOnWorkout(
    trainerId: string,
    studentId: string,
    dto: TrainerCommentDto,
  ) {
    const comment = await this.trainerCommentRepo.save(
      this.trainerCommentRepo.create({
        trainerId,
        studentId,
        activityId: dto.workoutId,
        comment: dto.comment,
      }),
    );

    await this.notificationsRepo.save(
      this.notificationsRepo.create({
        userId: studentId,
        title: 'Seu personal comentou seu treino',
        body: dto.comment.slice(0, 100),
        type: 'info',
      } as any),
    );

    return comment;
  }
}
