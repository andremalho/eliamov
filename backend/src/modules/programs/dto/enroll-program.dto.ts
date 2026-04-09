import { IsUUID } from 'class-validator';

export class EnrollProgramDto {
  @IsUUID()
  programId: string;
}
