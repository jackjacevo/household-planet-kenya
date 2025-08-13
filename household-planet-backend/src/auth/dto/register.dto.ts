import { IsEmail, IsString, IsOptional, IsPhoneNumber, IsEnum, IsDateString } from 'class-validator';
import { UserRole } from '../../common/enums';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}