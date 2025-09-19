import { IsString } from 'class-validator';

export class SocialAuthDto {
  @IsString()
  token: string;
}