import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramsDto } from './dto/create-programs.dto';
import { EnrollProgramDto } from './dto/enroll-program.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly service: ProgramsService) {}

  // ── Enrollment endpoints (placed before :id to avoid route conflicts) ──

  @Post('enroll')
  enroll(
    @CurrentUser() user: { userId: string },
    @Body() dto: EnrollProgramDto,
  ) {
    return this.service.enroll(user.userId, dto.programId);
  }

  @Get('my-enrollments')
  myEnrollments(@CurrentUser() user: { userId: string }) {
    return this.service.getMyEnrollments(user.userId);
  }

  @Patch('enrollments/:id')
  updateEnrollment(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.service.updateProgress(user.userId, id, dto);
  }

  @Delete('enrollments/:id')
  abandonEnrollment(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.abandonEnrollment(user.userId, id);
  }

  // ── Existing program CRUD ──

  @Get()
  findAll() {
    return this.service.findAllPublished();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProgramsDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
