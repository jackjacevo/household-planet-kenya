import { IsEmail, IsString, MinLength, IsOptional, MaxLength, Matches } from 'class-validator';
import { IsSecureInput, IsStrongPassword } from '../../common/validators/secure-input.validator';
import { IsKenyanPhone } from '../../common/validators/enhanced-validators';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsSecureInput()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsOptional()
  @IsKenyanPhone()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9]{6,20}$/, { message: 'Invalid referral code format' })
  referralCode?: string;
}