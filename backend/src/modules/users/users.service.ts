import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateUserDto) {
    return this.repo.save(this.repo.create(dto as any));
  }

  update(id: string, dto: Partial<User>) {
    return this.repo.update(id, dto as any);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();

    const { profile: incomingProfile, markOnboardingComplete, ...flat } = dto;
    Object.assign(user, flat);

    if (incomingProfile) {
      user.profile = { ...(user.profile ?? {}), ...incomingProfile };
    }

    if (markOnboardingComplete) {
      user.onboardingCompletedAt = new Date();
    }

    await this.repo.save(user);
    const { password, ...rest } = user;
    return rest;
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
