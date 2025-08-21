import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export enum ConsentType {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  FUNCTIONAL = 'functional',
}

export class CookieConsentDto {
  @IsBoolean()
  necessary: boolean;

  @IsBoolean()
  analytics: boolean;

  @IsBoolean()
  marketing: boolean;

  @IsBoolean()
  functional: boolean;
}

export class DataExportRequestDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class DataDeletionRequestDto {
  @IsString()
  reason: string;

  @IsBoolean()
  @IsOptional()
  confirmDeletion?: boolean;
}

export class ConsentUpdateDto {
  @IsEnum(ConsentType)
  type: ConsentType;

  @IsBoolean()
  granted: boolean;

  @IsString()
  @IsOptional()
  purpose?: string;
}

export class PrivacySettingsDto {
  @IsBoolean()
  @IsOptional()
  profileVisibility?: boolean;

  @IsBoolean()
  @IsOptional()
  dataProcessing?: boolean;

  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @IsBoolean()
  @IsOptional()
  analyticsTracking?: boolean;
}