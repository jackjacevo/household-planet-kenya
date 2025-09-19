import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export class VerifyAddressDto {
  @IsEnum(['VERIFIED', 'FAILED', 'REJECTED'])
  status: 'VERIFIED' | 'FAILED' | 'REJECTED';

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  coordinates?: any;
}
