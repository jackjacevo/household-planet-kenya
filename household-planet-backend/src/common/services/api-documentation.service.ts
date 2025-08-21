import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiDocumentationService {
  getSecurityGuidelines() {
    return {
      authentication: {
        type: 'Bearer Token (JWT)',
        header: 'Authorization: Bearer <token>',
        expiration: '7 days',
        refreshRequired: true
      },
      authorization: {
        roles: ['user', 'admin', 'moderator'],
        permissions: 'Role-based access control',
        inheritance: 'Hierarchical role system'
      },
      rateLimiting: {
        default: '100 requests per 15 minutes',
        authenticated: '1000 requests per 15 minutes',
        sensitive: '10 requests per minute',
        headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
      },
      security: {
        cors: 'Configured for specific origins only',
        csrf: 'CSRF tokens required for state-changing operations',
        headers: 'Security headers automatically applied',
        validation: 'Input validation and sanitization enabled',
        encryption: 'Sensitive data encrypted at rest and in transit'
      },
      versioning: {
        current: 'v1',
        supported: ['v1', 'v2'],
        header: 'API-Version: v1',
        deprecation: 'Deprecated versions supported for 6 months'
      },
      monitoring: {
        logging: 'All requests logged for security monitoring',
        audit: 'Sensitive operations audited',
        alerts: 'Automated security alerts for suspicious activity'
      },
      bestPractices: [
        'Always use HTTPS in production',
        'Include API version in requests',
        'Handle rate limiting gracefully',
        'Validate all input data',
        'Use proper error handling',
        'Implement request timeouts',
        'Cache responses appropriately',
        'Monitor API usage patterns'
      ]
    };
  }

  getEndpointSecurity(endpoint: string) {
    const securityMap = {
      '/auth/login': {
        rateLimit: '5 requests per minute',
        bruteForceProtection: true,
        requireHttps: true
      },
      '/auth/register': {
        rateLimit: '3 requests per minute',
        emailVerification: true,
        requireHttps: true
      },
      '/admin/*': {
        requireAuth: true,
        roles: ['admin'],
        auditLog: true,
        sensitiveData: true
      },
      '/payments/*': {
        requireAuth: true,
        encryption: 'End-to-end',
        auditLog: true,
        rateLimit: '10 requests per minute'
      }
    };

    return securityMap[endpoint] || {
      requireAuth: true,
      rateLimit: '100 requests per 15 minutes'
    };
  }
}