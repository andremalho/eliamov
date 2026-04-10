import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsIn } from 'class-validator';
import { Role } from '../role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsIn(['female_user', 'personal_trainer', 'family_companion', 'academy_admin'])
  profileType?: 'female_user' | 'personal_trainer' | 'family_companion' | 'academy_admin';

  @IsOptional()
  @IsString()
  academyCode?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class CreateAuthDto extends RegisterDto {}
