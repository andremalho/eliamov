import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { OnboardingStepDto } from './dto/onboarding-step.dto';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';
import { SkipOnboarding } from './guards/onboarding.guard';

@Controller('auth')
@SkipOnboarding()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.authService.me(user.userId);
  }

  @Patch('onboarding/step')
  saveOnboardingStep(@CurrentUser() user: { userId: string }, @Body() dto: OnboardingStepDto) {
    return this.authService.saveOnboardingStep(user.userId, dto);
  }

  @Get('onboarding/status')
  getOnboardingStatus(@CurrentUser() user: { userId: string }) {
    return this.authService.getOnboardingStatus(user.userId);
  }
}
