import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SecurityValidationService {
  
  validateHttpsInProduction(req: Request): boolean {
    if (process.env.NODE_ENV === 'production') {
      const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
      if (!isHttps) {
        return false;
      }
    }
    return true;
  }

  validateCsrfToken(req: Request): boolean {
    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    const token = req.get('X-CSRF-Token') || req.body?._csrf;
    return !!token;
  }

  sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove potentially dangerous headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-csrf-token'];
    
    // Sanitize remaining headers
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key]
          .replace(/[\r\n]/g, '')
          .substring(0, 200);
      }
    });

    return sanitized;
  }

  isSecureEndpoint(url: string): boolean {
    const securePatterns = [
      '/api/auth',
      '/api/payments',
      '/api/admin',
      '/api/users/profile',
      '/api/orders'
    ];

    return securePatterns.some(pattern => url.includes(pattern));
  }
}