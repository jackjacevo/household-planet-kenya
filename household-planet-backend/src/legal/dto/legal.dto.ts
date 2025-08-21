import { IsString, IsOptional, IsEnum, IsIP, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateLegalAgreementDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  userAgent?: string;
}

export class LegalDocumentRequestDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsEnum(['DATA_EXPORT', 'DATA_DELETION', 'CONSENT_WITHDRAWAL', 'DOCUMENT_COPY'])
  requestType: 'DATA_EXPORT' | 'DATA_DELETION' | 'CONSENT_WITHDRAWAL' | 'DOCUMENT_COPY';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}

export class ConsentWithdrawalDto {
  @IsEnum(['MARKETING', 'ANALYTICS', 'COOKIES', 'PROFILING'])
  consentType: 'MARKETING' | 'ANALYTICS' | 'COOKIES' | 'PROFILING';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}