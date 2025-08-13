import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { USER_ROLE, type UserRole } from '../types';

const validUserRole = [USER_ROLE.admin, USER_ROLE.user] as const;

export class ProfileEntity {
  @IsUUID()
  id: string;

  @IsDateString()
  created_at: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string | null;

  @IsIn(validUserRole)
  user_role: UserRole;
}
