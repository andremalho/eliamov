import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column('simple-array', { nullable: true })
  healthConditions: string[];

  @Column({
    type: 'enum',
    enum: ['sedentary', 'beginner', 'intermediate', 'advanced'],
    nullable: true,
  })
  fitnessLevel: 'sedentary' | 'beginner' | 'intermediate' | 'advanced';

  @Column({
    type: 'enum',
    enum: ['weight_loss', 'health', 'strength', 'wellbeing', 'pregnancy', 'bone_health'],
    nullable: true,
  })
  fitnessGoal:
    | 'weight_loss'
    | 'health'
    | 'strength'
    | 'wellbeing'
    | 'pregnancy'
    | 'bone_health';

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: [
      'user',
      'professional',
      'admin',
      'tenant_admin',
      'female_user',
      'personal_trainer',
      'family_companion',
      'academy_admin',
      'academy_manager',
      'super_admin',
    ],
    default: 'female_user',
  })
  role: string;

  @Column({
    type: 'enum',
    enum: ['female', 'male', 'other', 'prefer_not_to_say'],
    nullable: true,
  })
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say' | null;

  @Column({
    type: 'enum',
    enum: ['full', 'trainer', 'companion', 'admin'],
    default: 'full',
  })
  profileType: 'full' | 'trainer' | 'companion' | 'admin';

  @Column({ default: false })
  isProfileComplete: boolean;

  @Column({ type: 'int', default: 0 })
  onboardingStep: number;

  @Column({ type: 'jsonb', nullable: true })
  profile: Record<string, any> | null;

  @Column({ type: 'timestamptz', nullable: true })
  onboardingCompletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
