import { Module } from '@nestjs/common';
import { ApiLoggingService } from './api-logging.service';
import { ApiVersioningService } from './api-versioning.service';
import { CorsConfigService } from './cors-config.service';
import { ApiDocumentationService } from './api-documentation.service';
import { ApiSecurityController } from './api-security.controller';

@Module({
  controllers: [ApiSecurityController],
  providers: [
    ApiLoggingService,
    ApiVersioningService,
    CorsConfigService,
    ApiDocumentationService,
  ],
  exports: [
    ApiLoggingService,
    ApiVersioningService,
    CorsConfigService,
    ApiDocumentationService,
  ],
})
export class ApiSecurityModule {}