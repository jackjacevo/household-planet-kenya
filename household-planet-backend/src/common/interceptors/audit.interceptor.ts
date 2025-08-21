import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;
    const userAgent = request.get('User-Agent') || '';

    // Only audit sensitive operations
    const sensitiveOperations = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const sensitiveEndpoints = ['/auth/', '/admin/', '/payments/', '/orders/'];

    const isSensitive = sensitiveOperations.includes(method) || 
                       sensitiveEndpoints.some(endpoint => url.includes(endpoint));

    if (!isSensitive) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.auditService.log({
            userId: user?.userId,
            action: method,
            resource: url,
            ip,
            userAgent,
            timestamp: new Date(),
            details: {
              duration,
              success: true,
              responseSize: JSON.stringify(response).length
            }
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.auditService.log({
            userId: user?.userId,
            action: method,
            resource: url,
            ip,
            userAgent,
            timestamp: new Date(),
            details: {
              duration,
              success: false,
              error: error.message
            }
          });
        }
      })
    );
  }
}