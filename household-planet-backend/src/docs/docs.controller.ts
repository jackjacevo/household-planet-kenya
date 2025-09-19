import { Controller, Get, Param } from '@nestjs/common';
import { ApiVersion } from '../common/decorators/api-version.decorator';

@Controller('docs')
@ApiVersion('v1')
export class DocsController {
  
  @Get('security')
  getSecurityGuidelines() {
    return {
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        expiration: '7 days'
      },
      rateLimit: {
        default: '100 requests per 15 minutes',
        authenticated: '1000 requests per 15 minutes',
        sensitive: '10 requests per minute'
      },
      cors: {
        allowedOrigins: ['localhost:3000', 'householdplanet.co.ke'],
        credentials: true
      },
      headers: {
        required: ['Content-Type'],
        optional: ['API-Version', 'X-CSRF-Token']
      }
    };
  }

  @Get('security/endpoint/:path')
  getEndpointSecurity(@Param('path') path: string) {
    const endpoints = {
      'auth/login': { rateLimit: '5/min', auth: false, csrf: true },
      'upload': { rateLimit: '10/min', auth: true, fileSize: '10MB' },
      'orders': { rateLimit: '100/15min', auth: true, csrf: true }
    };
    
    return endpoints[path] || { message: 'Endpoint not documented' };
  }
}
