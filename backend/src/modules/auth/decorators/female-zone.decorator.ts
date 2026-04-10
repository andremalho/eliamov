import { applyDecorators, UseGuards } from '@nestjs/common';
import { FemaleZoneGuard } from '../guards/female-zone.guard';

export const FemaleZoneOnly = () =>
  applyDecorators(UseGuards(FemaleZoneGuard));
