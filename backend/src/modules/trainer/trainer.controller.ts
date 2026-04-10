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
import { PrescribeWorkoutDto } from './dto/prescribe-workout.dto';
import { TrainerCommentDto } from './dto/trainer-comment.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';
import { TrainerAccessGuard } from './guards/trainer-access.guard';

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

  @Get('dashboard')
  @Roles(Role.PERSONAL_TRAINER, 'professional')
  getDashboard(@Request() req) {
    return this.trainerService.getDashboard(req.user.userId);
  }

  @Get('students/:studentId/workouts')
  @UseGuards(TrainerAccessGuard)
  getStudentWorkouts(
    @Request() req,
    @Param('studentId') studentId: string,
  ) {
    return this.trainerService.getStudentWorkouts(
      req.user.userId,
      studentId,
      req.trainerLink,
    );
  }

  @Get('students/:studentId/progress')
  @UseGuards(TrainerAccessGuard)
  getStudentProgress(
    @Request() req,
    @Param('studentId') studentId: string,
  ) {
    return this.trainerService.getStudentProgress(
      req.user.userId,
      studentId,
      req.trainerLink,
    );
  }

  @Post('students/:studentId/prescribe')
  @UseGuards(TrainerAccessGuard)
  prescribeWorkout(
    @Request() req,
    @Param('studentId') studentId: string,
    @Body() dto: PrescribeWorkoutDto,
  ) {
    return this.trainerService.prescribeWorkout(
      req.user.userId,
      studentId,
      dto,
    );
  }

  @Get('prescriptions')
  @Roles(Role.PERSONAL_TRAINER, 'professional')
  getMyPrescriptions(@Request() req) {
    return this.trainerService.getMyPrescriptions(req.user.userId);
  }

  @Post('students/:studentId/comment')
  @UseGuards(TrainerAccessGuard)
  commentOnWorkout(
    @Request() req,
    @Param('studentId') studentId: string,
    @Body() dto: TrainerCommentDto,
  ) {
    return this.trainerService.commentOnWorkout(
      req.user.userId,
      studentId,
      dto,
    );
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
