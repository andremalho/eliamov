import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandRolesAndLinks1712700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new values to the existing role enum
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'female_user'`,
    );
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'personal_trainer'`,
    );
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'family_companion'`,
    );
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'academy_admin'`,
    );
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'academy_manager'`,
    );
    await queryRunner.query(
      `ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'super_admin'`,
    );

    // Add new columns to users
    await queryRunner.query(
      `CREATE TYPE users_gender_enum AS ENUM ('female', 'male', 'other', 'prefer_not_to_say')`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender users_gender_enum`,
    );
    await queryRunner.query(
      `CREATE TYPE users_profile_type_enum AS ENUM ('full', 'trainer', 'companion', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "profileType" users_profile_type_enum DEFAULT 'full'`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "isProfileComplete" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS "onboardingStep" integer DEFAULT 0`,
    );

    // Migrate existing roles
    await queryRunner.query(
      `UPDATE users SET role = 'female_user' WHERE role = 'user'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'personal_trainer' WHERE role = 'professional'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'super_admin' WHERE role = 'admin'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'academy_admin' WHERE role = 'tenant_admin'`,
    );

    // Create trainer_student_links
    await queryRunner.query(
      `CREATE TYPE trainer_student_links_status_enum AS ENUM ('pending', 'active', 'revoked')`,
    );
    await queryRunner.query(`
      CREATE TABLE trainer_student_links (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "trainerId" uuid NOT NULL REFERENCES users(id),
        "studentId" uuid NOT NULL REFERENCES users(id),
        "academyId" uuid NOT NULL,
        permissions jsonb DEFAULT '{"viewWorkouts":true,"viewProgress":true,"viewCycleData":false}',
        status trainer_student_links_status_enum DEFAULT 'pending',
        "invitedAt" TIMESTAMP DEFAULT now(),
        "acceptedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP
      )
    `);

    // Create family_links
    await queryRunner.query(
      `CREATE TYPE family_links_status_enum AS ENUM ('pending', 'active', 'revoked')`,
    );
    await queryRunner.query(`
      CREATE TABLE family_links (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "companionId" uuid NOT NULL REFERENCES users(id),
        "memberId" uuid NOT NULL REFERENCES users(id),
        permissions jsonb DEFAULT '{"viewWorkouts":true,"viewGoals":true,"viewFeed":false}',
        status family_links_status_enum DEFAULT 'pending',
        "invitedAt" TIMESTAMP DEFAULT now(),
        "acceptedAt" TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS family_links`);
    await queryRunner.query(`DROP TABLE IF EXISTS trainer_student_links`);
    await queryRunner.query(`DROP TYPE IF EXISTS family_links_status_enum`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS trainer_student_links_status_enum`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS "onboardingStep"`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS "isProfileComplete"`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS "profileType"`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS gender`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS users_profile_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS users_gender_enum`);
  }
}
