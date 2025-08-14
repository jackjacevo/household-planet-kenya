import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

@Injectable()
export class CorsConfigService {
  private readonly allowedOrigins = this.getAllowedOrigins();
  private readonly allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  private readonly allowedHeaders = [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Session-ID',
    'X-API-Version',
    'X-Requested-With',
  ];

  getCorsOptions(): CorsOptions {
    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        if (this.isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      methods: this.allowedMethods,
      allowedHeaders: this.allowedHeaders,
      exposedHeaders: ['X-CSRF-Token', 'X-API-Version', 'X-Rate-Limit-Remaining'],
      credentials: true,
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }

  private getAllowedOrigins(): string[] {
    const baseOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ];

    if (process.env.NODE_ENV === 'production') {
      return [
        'https://householdplanetkenya.com',
        'https://www.householdplanetkenya.com',
        'https://admin.householdplanetkenya.com',
        ...this.getEnvironmentOrigins(),
      ];
    }

    return [...baseOrigins, ...this.getEnvironmentOrigins()];
  }

  private getEnvironmentOrigins(): string[] {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (!envOrigins) {
      return [];
    }

    return envOrigins.split(',').map(origin => origin.trim());
  }

  private isOriginAllowed(origin: string): boolean {
    // Exact match
    if (this.allowedOrigins.includes(origin)) {
      return true;
    }

    // Pattern matching for subdomains in production
    if (process.env.NODE_ENV === 'production') {
      const allowedPatterns = [
        /^https:\/\/[\w-]+\.householdplanetkenya\.com$/,
      ];

      return allowedPatterns.some(pattern => pattern.test(origin));
    }

    // Development mode - allow localhost with any port
    if (process.env.NODE_ENV === 'development') {
      const devPatterns = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ];

      return devPatterns.some(pattern => pattern.test(origin));
    }

    return false;
  }

  validateOrigin(origin: string): boolean {
    return this.isOriginAllowed(origin);
  }

  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    };
  }
}