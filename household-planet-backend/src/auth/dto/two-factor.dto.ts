import { IsString } from 'class-validator';

export class TwoFactorDto {
  @IsString()
  code: string;
}