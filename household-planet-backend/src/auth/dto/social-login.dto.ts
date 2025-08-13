import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

export class SocialLoginDto {
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @IsString()
  accessToken: string;

  @IsOptional()
  @IsString()
  idToken?: string;
}

export class SocialUserDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsEnum(SocialProvider)
  provider: SocialProvider;
}