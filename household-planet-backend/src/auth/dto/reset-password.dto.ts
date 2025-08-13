import { IsEmail, IsString } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsStrongPassword()
  password: string;
}