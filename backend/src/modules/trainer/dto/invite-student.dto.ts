import { IsEmail, IsUUID, IsOptional, IsObject } from 'class-validator';

export class InviteStudentDto {
  @IsEmail()
  studentEmail: string;

  @IsUUID()
  academyId: string;

  @IsOptional()
  @IsObject()
  permissions?: {
    viewWorkouts?: boolean;
    viewProgress?: boolean;
    viewCycleData?: boolean;
  };
}
