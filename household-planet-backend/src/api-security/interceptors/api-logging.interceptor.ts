import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiLoggingService } from '../api-logging.service';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  constructor(private readonly apiLogging: ApiLoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.apiLogging.logRequest(request, response, responseTime);

          // Log data access for sensitive endpoints
          if (this.isSensitiveEndpoint(request.url)) {
            this.apiLogging.logDataAccess(
              request.user?.id || 'anonymous',
              request.url,
              request.method
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.apiLogging.logRequest(request, response, responseTime);
          
          // Log security events for certain errors
          if (error.status === 401 || error.status === 403) {
            this.apiLogging.logSecurityEvent('unauthorized_access', {
              url: request.url,
              method: request.method,
              ip: request.ip,
              userAgent: request.get('User-Agent'),
              userId: request.user?.id,
            });
          }
        },
      })
    );
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = [
      '/api/users',
      '/api/admin',
      '/api/payments',
      '/api/orders',
      '/api/auth',
    ];

    return sensitivePatterns.some(pattern => url.includes(pattern));
  }
}