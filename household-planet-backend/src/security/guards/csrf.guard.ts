import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfProtectionService } from '../csrf-protection.service';
import { SecureLoggerService } from '../secure-logger.service';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(
    private readonly csrfService: CsrfProtectionService,
    private readonly secureLogger: SecureLoggerService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if CSRF protection should be skipped for this route
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method.toLowerCase();
    const userAgent = request.headers['user-agent'];
    const ip = this.getClientIp(request);
    const userId = request.user?.id;

    // Only check CSRF for state-changing methods
    if (!['post', 'put', 'patch', 'delete'].includes(method)) {
      return true;
    }

    // Enhanced API endpoint validation
    if (this.isApiEndpoint(request)) {
      // For API endpoints, use double-submit cookie pattern
      const cookieToken = request.cookies?.['csrf-token'];
      const headerToken = request.headers['x-csrf-token'];
      
      if (cookieToken && headerToken) {
        const isValidDoubleSubmit = this.csrfService.validateDoubleSubmitToken(cookieToken, headerToken);
        if (isValidDoubleSubmit) {
          return true;
        }
      }
      
      // Fallback to JWT validation for API endpoints
      if (this.hasValidApiAuth(request)) {
        // Additional origin validation for API requests
        if (!this.validateOrigin(request)) {
          this.secureLogger.security('CSRF_ORIGIN_MISMATCH', {
            method,
            url: request.url,
            origin: request.headers.origin,
            referer: request.headers.referer
          }, userId, ip);
          throw new ForbiddenException('Invalid request origin');
        }
        return true;
      }
    }

    // Traditional CSRF token validation for web forms
    const sessionId = this.getSessionId(request);
    const csrfToken = this.getCsrfToken(request);

    if (!sessionId) {
      this.secureLogger.security('CSRF_NO_SESSION', {
        method,
        url: request.url,
        userAgent
      }, userId, ip);
      throw new ForbiddenException('Session required for CSRF protection');
    }

    if (!csrfToken) {
      this.secureLogger.security('CSRF_TOKEN_MISSING', {
        method,
        url: request.url,
        sessionId: sessionId.substring(0, 8) + '...'
      }, userId, ip);
      throw new ForbiddenException('CSRF token required');
    }

    const isValid = this.csrfService.validateToken(sessionId, csrfToken);
    
    if (!isValid) {
      this.secureLogger.security('CSRF_TOKEN_INVALID', {
        method,
        url: request.url,
        sessionId: sessionId.substring(0, 8) + '...',
        tokenLength: csrfToken.length
      }, userId, ip);
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  private isApiEndpoint(request: any): boolean {
    return request.url.startsWith('/api/');
  }

  private hasValidApiAuth(request: any): boolean {
    // Check for valid JWT token in Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    // Additional validation - check token format
    const token = authHeader.substring(7);
    return token.length > 20 && /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token);
  }

  private validateOrigin(request: any): boolean {
    const origin = request.headers.origin;
    const referer = request.headers.referer;
    const host = request.headers.host;
    
    // Allow same-origin requests
    if (origin && origin.includes(host)) {
      return true;
    }
    
    // Check referer as fallback
    if (referer && referer.includes(host)) {
      return true;
    }
    
    // Allow configured trusted origins
    const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [];
    return trustedOrigins.some(trusted => origin?.includes(trusted));
  }

  private getClientIp(request: any): string {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
           request.headers['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           'unknown';
  }

  private getSessionId(request: any): string | null {
    // Try to get session ID from various sources
    return request.session?.id || 
           request.cookies?.sessionId || 
           request.headers['x-session-id'] ||
           null;
  }

  private getCsrfToken(request: any): string | null {
    // Try to get CSRF token from various sources
    return request.headers['x-csrf-token'] ||
           request.headers['x-xsrf-token'] ||
           request.body?._csrf ||
           request.query?._csrf ||
           null;
  }
}