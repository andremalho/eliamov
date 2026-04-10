import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainerStudentLink } from '../entities/trainer-student-link.entity';
import { resolveRole } from '../../auth/role.enum';

@Injectable()
export class TrainerAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(TrainerStudentLink)
    private readonly linkRepo: Repository<TrainerStudentLink>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Nao autenticado');

    const role = resolveRole(user.role);
    if (role !== 'personal_trainer') {
      throw new ForbiddenException('Apenas personal trainers podem acessar');
    }

    const studentId = request.params.studentId;
    if (!studentId) return true;

    const link = await this.linkRepo.findOne({
      where: { trainerId: user.userId, studentId, status: 'active' },
    });

    if (!link) {
      throw new ForbiddenException(
        'Voce nao tem permissao para ver dados desta aluna',
      );
    }

    request.trainerLink = link;
    return true;
  }
}
