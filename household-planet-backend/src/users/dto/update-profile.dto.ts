import { IsString, IsEmail, IsOptional, IsUrl, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}

export class NotificationSettingsDto {
  @IsOptional()
  orderUpdates?: boolean;

  @IsOptional()
  promotions?: boolean;

  @IsOptional()
  newsletter?: boolean;

  @IsOptional()
  sms?: boolean;

  @IsOptional()
  push?: boolean;
}

export class PrivacySettingsDto {
  @IsOptional()
  @IsEnum(['public', 'private'])
  profileVisibility?: string;

  @IsOptional()
  showPurchaseHistory?: boolean;

  @IsOptional()
  allowDataCollection?: boolean;

  @IsOptional()
  allowPersonalization?: boolean;
}