import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiVersioningService } from './api-versioning.service';
import { ApiDocumentationService } from './api-documentation.service';
import { CorsConfigService } from './cors-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api-security')
export class ApiSecurityController {
  constructor(
    private readonly apiVersioning: ApiVersioningService,
    private readonly apiDocumentation: ApiDocumentationService,
    private readonly corsConfig: CorsConfigService,
  ) {}

  @Get('version-info')
  getVersionInfo() {
    return this.apiVersioning.getApiVersionInfo();
  }

  @Get('documentation')
  getSecurityDocumentation() {
    return {
      guidelines: this.apiDocumentation.getSecurityGuidelines(),
      endpoints: this.apiDocumentation.getApiEndpoints(),
      bestPractices: this.apiDocumentation.getSecurityBestPractices(),
    };
  }

  @Get('cors-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getCorsConfiguration() {
    return {
      corsOptions: this.corsConfig.getCorsOptions(),
      securityHeaders: this.corsConfig.getSecurityHeaders(),
    };
  }

  @Get('health')
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v2',
      environment: process.env.NODE_ENV || 'development',
      security: {
        httpsEnabled: process.env.NODE_ENV === 'production',
        rateLimitingEnabled: true,
        corsEnabled: true,
        authenticationRequired: true,
      },
    };
  }
}