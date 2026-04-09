import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantGuard } from './tenant.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantController],
  providers: [TenantService, TenantGuard],
  exports: [TenantService, TenantGuard],
})
export class TenantModule {}
