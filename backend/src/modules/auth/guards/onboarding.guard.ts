import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../public.decorator';

export const SKIP_ONBOARDING_KEY = 'skipOnboarding';
export const SkipOnboarding = () => SetMetadata(SKIP_ONBOARDING_KEY, true);

@Injectable()
export class OnboardingGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Skip if decorated with @SkipOnboarding
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ONBOARDING_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    // Skip for onboarding endpoints themselves
    const request = context.switchToHttp().getRequest();
    if (request.path?.startsWith('/auth/onboarding')) return true;
    if (request.path?.startsWith('/auth/me')) return true;

    const user = request.user;
    if (!user) return true; // let JwtAuthGuard handle

    const dbUser = await this.userRepo.findOneBy({ id: user.userId });
    if (!dbUser) return true;

    if (!dbUser.isProfileComplete) {
      throw new ForbiddenException({
        message: 'Complete seu cadastro',
        currentStep: dbUser.onboardingStep,
        totalSteps: this.getTotalSteps(dbUser.profileType),
        redirectTo: '/onboarding',
      });
    }

    return true;
  }

  private getTotalSteps(profileType: string): number {
    const map: Record<string, number> = { full: 4, trainer: 3, companion: 2, admin: 2 };
    return map[profileType] ?? 4;
  }
}
