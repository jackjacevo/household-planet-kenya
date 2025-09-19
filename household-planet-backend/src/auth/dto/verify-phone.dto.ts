import { IsString, IsPhoneNumber } from 'class-validator';

export class SendPhoneVerificationDto {
  @IsPhoneNumber('KE')
  phone: string;
}

export class VerifyPhoneDto {
  @IsPhoneNumber('KE')
  phone: string;

  @IsString()
  code: string;
}
