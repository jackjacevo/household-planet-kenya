import { SetMetadata } from '@nestjs/common';

export interface ApiSecurityOptions {
  requireAuth?: boolean;
  auditLog?: boolean;
  sensitiveData?: boolean;
  pciCompliant?: boolean;
  adminOnly?: boolean;
}

export const API_SECURITY_KEY = 'apiSecurity';
export const ApiSecurity = (options: ApiSecurityOptions) => SetMetadata(API_SECURITY_KEY, options);
