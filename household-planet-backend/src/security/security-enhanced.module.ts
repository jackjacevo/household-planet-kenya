import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { InputSanitizerService } from './input-sanitizer.service';
import { CsrfProtectionService } from './csrf-protection.service';
import { SecureLoggerService } from './secure-logger.service';
import { CsrfGuard } from './guards/csrf.guard';
import { InputSanitizationInterceptor } from './interceptors/input-sanitization.interceptor';
import { SecurityHeadersInterceptor } from './interceptors/security-headers.interceptor';

@Global()
@Module({
  providers: [
    InputSanitizerService,
    CsrfProtectionService,
    SecureLoggerService,
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InputSanitizationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityHeadersInterceptor,
    },
  ],
  exports: [
    InputSanitizerService,
    CsrfProtectionService,
    SecureLoggerService,
  ],
})
export class SecurityEnhancedModule {}