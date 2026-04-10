import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { OnboardingStepDto } from './dto/onboarding-step.dto';
import { TenantService } from '../tenant/tenant.service';
import { Role } from './role.enum';

const PROFILE_TYPE_TO_ROLE: Record<string, Role> = {
  female_user: Role.FEMALE_USER,
  personal_trainer: Role.PERSONAL_TRAINER,
  family_companion: Role.FAMILY_COMPANION,
  academy_admin: Role.ACADEMY_ADMIN,
};

const PROFILE_TYPE_MAP: Record<string, string> = {
  female_user: 'full',
  personal_trainer: 'trainer',
  family_companion: 'companion',
  academy_admin: 'admin',
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly tenantService: TenantService,
  ) {}

  private readonly ONBOARDING_STEPS: Record<string, { total: number; fields: Record<number, string[]> }> = {
    full: {
      total: 4,
      fields: {
        1: ['name', 'birthDate', 'avatarUrl'],
        2: ['fitnessGoal', 'fitnessLevel'],
        3: ['lastPeriodDate', 'cycleDuration', 'periodDuration', 'cycleActive'],
        4: ['academyCode'],
      },
    },
    trainer: {
      total: 3,
      fields: {
        1: ['cref', 'specialty'],
        2: ['academyCode'],
        3: ['avatarUrl', 'bio'],
      },
    },
    companion: {
      total: 2,
      fields: {
        1: ['name', 'relationship'],
        2: ['inviteToken'],
      },
    },
    admin: {
      total: 2,
      fields: {
        1: ['cnpj', 'academyName', 'address'],
        2: [], // pending_approval
      },
    },
  };

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    // Determine role and profileType from dto.profileType
    const role = dto.profileType
      ? PROFILE_TYPE_TO_ROLE[dto.profileType] ?? Role.FEMALE_USER
      : dto.role || Role.FEMALE_USER;

    const profileType = dto.profileType
      ? PROFILE_TYPE_MAP[dto.profileType] ?? 'full'
      : 'full';

    // Validate academyCode for trainer and admin
    let tenantId = dto.tenantId;
    if (dto.profileType === 'personal_trainer' || dto.profileType === 'academy_admin') {
      if (dto.academyCode) {
        const tenant = await this.tenantService.findBySlug(dto.academyCode);
        if (!tenant) throw new BadRequestException('Codigo de academia invalido');
        tenantId = tenant.id;
      }
    }

    if (!tenantId) {
      const demo = await this.tenantService.findDefault();
      tenantId = demo?.id;
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      password: hash,
      name: dto.name,
      tenantId,
      role,
      profileType: profileType as any,
      onboardingStep: 0,
      isProfileComplete: false,
    });
    await this.usersRepo.save(user);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitize(user);
  }

  async saveOnboardingStep(userId: string, dto: OnboardingStepDto) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();

    if (dto.step !== user.onboardingStep + 1) {
      throw new BadRequestException(`Step ${dto.step} invalido. Step atual: ${user.onboardingStep}`);
    }

    // Merge data into profile
    user.profile = { ...(user.profile ?? {}), ...dto.data };
    user.onboardingStep = dto.step;

    // Apply specific field mappings
    if (dto.data.birthDate) user.birthDate = dto.data.birthDate;
    if (dto.data.fitnessGoal) user.fitnessGoal = dto.data.fitnessGoal;
    if (dto.data.fitnessLevel) user.fitnessLevel = dto.data.fitnessLevel;
    if (dto.data.name) user.name = dto.data.name;

    // Handle academy code for step that has it
    if (dto.data.academyCode) {
      const tenant = await this.tenantService.findBySlug(dto.data.academyCode);
      if (tenant) user.tenantId = tenant.id;
    }

    const steps = this.ONBOARDING_STEPS[user.profileType];
    if (steps && dto.step >= steps.total) {
      // Admin requires approval
      if (user.profileType === 'admin') {
        user.profile = { ...user.profile, status: 'pending_approval' };
      } else {
        user.isProfileComplete = true;
        user.onboardingCompletedAt = new Date();
      }
    }

    await this.usersRepo.save(user);
    return this.getOnboardingStatus(userId);
  }

  async getOnboardingStatus(userId: string) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();

    const steps = this.ONBOARDING_STEPS[user.profileType] ?? this.ONBOARDING_STEPS.full;
    const nextStep = user.onboardingStep + 1;
    const nextStepFields = nextStep <= steps.total ? (steps.fields[nextStep] ?? []) : [];

    return {
      currentStep: user.onboardingStep,
      totalSteps: steps.total,
      isComplete: user.isProfileComplete,
      profileType: user.profileType,
      nextStepFields,
      redirectTo: this.getRedirectPath(user.profileType),
    };
  }

  private getRedirectPath(profileType: string): string {
    switch (profileType) {
      case 'trainer': return '/trainer';
      case 'companion': return '/companion';
      case 'admin': return '/admin';
      default: return '/dashboard';
    }
  }

  private buildAuthResponse(user: User) {
    const payload = { userId: user.id, tenantId: user.tenantId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.sanitize(user),
    };
  }

  private sanitize(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
