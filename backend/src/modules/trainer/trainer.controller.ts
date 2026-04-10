import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { InviteStudentDto } from './dto/invite-student.dto';
import { InviteCompanionDto } from './dto/invite-companion.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';

@Controller('trainer')
@UseGuards(RolesGuard)
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Post('invite-student')
  @Roles(Role.PERSONAL_TRAINER, 'professional')
  inviteStudent(@Request() req, @Body() dto: InviteStudentDto) {
    return this.trainerService.inviteStudent(req.user.userId, dto);
  }

  @Post('accept-invite/:linkId')
  @Roles(Role.FEMALE_USER, 'user')
  acceptInvite(@Request() req, @Param('linkId') linkId: string) {
    return this.trainerService.acceptStudentInvite(req.user.userId, linkId);
  }

  @Get('my-students')
  @Roles(Role.PERSONAL_TRAINER, 'professional')
  getMyStudents(@Request() req) {
    return this.trainerService.getMyStudents(req.user.userId);
  }
}

@Controller('companion')
@UseGuards(RolesGuard)
export class CompanionController {
  constructor(private readonly trainerService: TrainerService) {}

  @Post('invite')
  @Roles(Role.FEMALE_USER, 'user')
  inviteCompanion(@Request() req, @Body() dto: InviteCompanionDto) {
    return this.trainerService.inviteCompanion(req.user.userId, dto);
  }

  @Post('accept/:linkId')
  @Roles(Role.FAMILY_COMPANION)
  acceptCompanionInvite(@Request() req, @Param('linkId') linkId: string) {
    return this.trainerService.acceptCompanionInvite(req.user.userId, linkId);
  }

  @Get('my-member')
  @Roles(Role.FAMILY_COMPANION)
  getMyMember(@Request() req) {
    return this.trainerService.getMyMember(req.user.userId);
  }
}
