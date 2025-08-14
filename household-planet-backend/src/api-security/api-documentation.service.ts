import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiDocumentationService {
  getSecurityGuidelines(): {
    authentication: any;
    authorization: any;
    rateLimiting: any;
    fileUpload: any;
    dataValidation: any;
    errorHandling: any;
  } {
    return {
      authentication: {
        description: 'API uses JWT-based authentication',
        requirements: [
          'Include Authorization header with Bearer token',
          'Tokens expire after 24 hours',
          'Refresh tokens available for extended sessions',
        ],
        example: {
          header: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        endpoints: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          refresh: 'POST /api/auth/refresh',
        },
      },
      authorization: {
        description: 'Role-based access control (RBAC)',
        roles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
        permissions: {
          USER: ['read:own-data', 'write:own-data'],
          ADMIN: ['read:all-data', 'write:all-data', 'manage:users'],
          SUPER_ADMIN: ['*'],
        },
      },
      rateLimiting: {
        description: 'API endpoints are rate limited to prevent abuse',
        limits: {
          authentication: '5 requests per minute',
          fileUpload: '10 requests per minute',
          general: '100 requests per minute',
        },
        headers: {
          'X-Rate-Limit-Limit': 'Request limit per window',
          'X-Rate-Limit-Remaining': 'Requests remaining in window',
          'X-Rate-Limit-Reset': 'Time when limit resets',
        },
      },
      fileUpload: {
        description: 'Secure file upload with validation and scanning',
        restrictions: {
          maxSize: '10MB per file',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          maxFiles: '5 files per request',
          virusScanning: 'All files are scanned for malware',
        },
        endpoints: {
          single: 'POST /api/files/upload',
          multiple: 'POST /api/files/upload-multiple',
        },
      },
      dataValidation: {
        description: 'All input data is validated and sanitized',
        features: [
          'Input validation using class-validator',
          'SQL injection prevention',
          'XSS protection',
          'CSRF protection',
        ],
      },
      errorHandling: {
        description: 'Standardized error responses',
        format: {
          error: 'Error type',
          message: 'Human-readable error message',
          statusCode: 'HTTP status code',
          timestamp: 'ISO timestamp',
          path: 'Request path',
        },
        example: {
          error: 'BadRequestException',
          message: 'Validation failed',
          statusCode: 400,
          timestamp: '2024-01-01T00:00:00.000Z',
          path: '/api/products',
        },
      },
    };
  }

  getApiEndpoints(): any {
    return {
      authentication: {
        'POST /api/auth/register': {
          description: 'Register new user account',
          rateLimit: '5/min',
          body: {
            email: 'string (required)',
            password: 'string (required, min 8 chars)',
            firstName: 'string (required)',
            lastName: 'string (required)',
          },
        },
        'POST /api/auth/login': {
          description: 'Authenticate user',
          rateLimit: '5/min',
          body: {
            email: 'string (required)',
            password: 'string (required)',
          },
        },
      },
      products: {
        'GET /api/products': {
          description: 'Get all products',
          rateLimit: '100/min',
          query: {
            page: 'number (optional)',
            limit: 'number (optional)',
            category: 'string (optional)',
          },
        },
        'POST /api/products': {
          description: 'Create new product (Admin only)',
          rateLimit: '20/min',
          auth: 'Required (Admin)',
          body: {
            name: 'string (required)',
            description: 'string (required)',
            price: 'number (required)',
            category: 'string (required)',
          },
        },
      },
      files: {
        'POST /api/files/upload': {
          description: 'Upload single file',
          rateLimit: '10/min',
          auth: 'Required',
          body: 'multipart/form-data with file field',
        },
        'POST /api/files/upload-multiple': {
          description: 'Upload multiple files',
          rateLimit: '5/min',
          auth: 'Required',
          body: 'multipart/form-data with files field (max 5 files)',
        },
      },
    };
  }

  getSecurityBestPractices(): string[] {
    return [
      'Always use HTTPS in production',
      'Store JWT tokens securely (httpOnly cookies recommended)',
      'Implement proper CORS policies',
      'Validate all input data',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting on all endpoints',
      'Log security events for monitoring',
      'Keep dependencies updated',
      'Use strong passwords and enable 2FA',
      'Implement proper error handling (don\'t expose sensitive info)',
      'Use secure headers (CSP, HSTS, etc.)',
      'Regularly audit and test security measures',
    ];
  }
}