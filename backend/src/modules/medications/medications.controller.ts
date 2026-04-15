import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { FemaleZoneOnly } from '../auth/decorators/female-zone.decorator';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Controller('medications')
@FemaleZoneOnly()
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }, @Query('includeInactive') includeInactive?: string) {
    return includeInactive === 'true'
      ? this.medicationsService.findAll(user.userId)
      : this.medicationsService.findAllActive(user.userId);
  }

  @Patch(':id')
  update(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body() dto: UpdateMedicationDto) {
    return this.medicationsService.update(user.userId, id, dto);
  }

  @Patch(':id/discontinue')
  discontinue(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.medicationsService.discontinue(user.userId, id);
  }
}
