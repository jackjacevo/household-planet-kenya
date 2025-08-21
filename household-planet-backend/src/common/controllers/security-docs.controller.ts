import { Controller, Get, Param } from '@nestjs/common';
import { ApiDocumentationService } from '../services/api-documentation.service';

@Controller('docs/security')
export class SecurityDocsController {
  constructor(private apiDocService: ApiDocumentationService) {}

  @Get()
  getSecurityGuidelines() {
    return {
      message: 'API Security Guidelines',
      data: this.apiDocService.getSecurityGuidelines(),
      timestamp: new Date().toISOString()
    };
  }

  @Get('endpoint/:path(*)')
  getEndpointSecurity(@Param('path') path: string) {
    const fullPath = `/${path}`;
    return {
      endpoint: fullPath,
      security: this.apiDocService.getEndpointSecurity(fullPath),
      timestamp: new Date().toISOString()
    };
  }

  @Get('status')
  getSecurityStatus() {
    return {
      status: 'operational',
      features: {
        authentication: 'JWT Bearer Token',
        authorization: 'Role-based access control',
        rateLimiting: 'Active',
        cors: 'Configured',
        csrf: 'Protected',
        encryption: 'TLS 1.3',
        monitoring: 'Active',
        audit: 'Enabled'
      },
      lastUpdated: new Date().toISOString()
    };
  }
}