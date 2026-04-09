import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCoursesDto } from './dto/create-courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private readonly repo: Repository<Course>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(dto: CreateCoursesDto) { return this.repo.save(this.repo.create(dto as any)); }
  update(id: string, dto: Partial<Course>) { return this.repo.update(id, dto as any); }
  remove(id: string) { return this.repo.delete(id); }
}
