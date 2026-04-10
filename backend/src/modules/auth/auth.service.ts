import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { TenantService } from '../tenant/tenant.service';
import { Role } from './role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly tenantService: TenantService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    let tenantId = dto.tenantId;
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
      role: dto.role || Role.FEMALE_USER,
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
