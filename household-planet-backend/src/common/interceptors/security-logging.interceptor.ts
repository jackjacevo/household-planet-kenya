import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const userId = request.user?.id || 'Anonymous';
    const startTime = Date.now();

    // Log security-relevant request details
    this.logSecurityEvent('REQUEST', {
      method,
      url,
      ip,
      userAgent,
      userId,
      timestamp: new Date().toISOString(),
      headers: this.sanitizeHeaders(headers)
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logSecurityEvent('RESPONSE_SUCCESS', {
          method,
          url,
          ip,
          userId,
          statusCode: response.statusCode,
          duration,
          timestamp: new Date().toISOString()
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logSecurityEvent('RESPONSE_ERROR', {
          method,
          url,
          ip,
          userId,
          error: error.message,
          statusCode: error.status || 500,
          duration,
          timestamp: new Date().toISOString()
        });
        return throwError(() => error);
      })
    );
  }

  private logSecurityEvent(type: string, data: any) {
    const logEntry = {
      type,
      ...data,
      environment: process.env.NODE_ENV || 'development'
    };

    if (type === 'RESPONSE_ERROR' || this.isSuspiciousActivity(data)) {
      this.logger.warn(`SECURITY_${type}`, logEntry);
    } else {
      this.logger.log(`SECURITY_${type}`, logEntry);
    }
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private isSuspiciousActivity(data: any): boolean {
    const suspiciousPatterns = [
      /\.\.\//,  // Path traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i // JavaScript injection
    ];

    const checkString = JSON.stringify(data).toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(checkString));
  }
}
