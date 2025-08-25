import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { IsSecureInput } from '../../common/validators/secure-input.validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsSecureInput()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(128, { message: 'Password too long' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Two-factor code must be 6 digits' })
  @MaxLength(6, { message: 'Two-factor code must be 6 digits' })
  twoFactorCode?: string;
}