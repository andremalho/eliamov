import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWeightLossTables1712800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE weight_loss_sex_enum AS ENUM ('M', 'F')
    `);
    await queryRunner.query(`
      CREATE TYPE weight_loss_comorbidity_enum AS ENUM ('none', 'dm2', 'hypertension', 'metabolic_syndrome', 'pcos')
    `);
    await queryRunner.query(`
      CREATE TABLE weight_loss_assessments (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid NOT NULL REFERENCES users(id),
        "tenantId" uuid,
        age int NOT NULL,
        "biologicalSex" weight_loss_sex_enum NOT NULL,
        "weightKg" decimal(5,2) NOT NULL,
        "heightCm" decimal(5,2) NOT NULL,
        "activityFactor" decimal(4,3) NOT NULL,
        "targetWeightKg" decimal(5,2) NOT NULL,
        "deadlineMonths" int NOT NULL,
        comorbidity weight_loss_comorbidity_enum DEFAULT 'none',
        bmi decimal(5,2),
        tmb decimal(7,2),
        tdee decimal(7,2),
        "dailyCalorieGoal" int,
        "caloricDeficit" int,
        "proteinG" decimal(5,1),
        "carbsG" decimal(5,1),
        "fatsG" decimal(5,1),
        "estimatedWeeklyLossKg" decimal(4,2),
        "estimatedWeeksToGoal" int,
        "weeklyPlan" jsonb,
        "comorbidityProtocol" jsonb,
        "wellnessProgramId" uuid,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_wla_user ON weight_loss_assessments("userId")`);
    await queryRunner.query(`CREATE INDEX idx_wla_tenant ON weight_loss_assessments("tenantId")`);

    await queryRunner.query(`
      CREATE TABLE weight_loss_checkins (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        "assessmentId" uuid NOT NULL REFERENCES weight_loss_assessments(id),
        "userId" uuid NOT NULL REFERENCES users(id),
        "weekNumber" int NOT NULL,
        "weightKg" decimal(5,2) NOT NULL,
        "adherencePercent" int NOT NULL,
        notes text,
        "expectedWeightKg" decimal(5,2),
        "deltaFromExpected" decimal(4,2),
        "createdAt" TIMESTAMP DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_wlc_assessment ON weight_loss_checkins("assessmentId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS weight_loss_checkins`);
    await queryRunner.query(`DROP TABLE IF EXISTS weight_loss_assessments`);
    await queryRunner.query(`DROP TYPE IF EXISTS weight_loss_comorbidity_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS weight_loss_sex_enum`);
  }
}
