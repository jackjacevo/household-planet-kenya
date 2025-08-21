import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const DEPRECATED_KEY = 'deprecated';
export const Deprecated = (version: string, sunset?: string) => 
  (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(DEPRECATED_KEY, { version, sunset }, 
      propertyKey ? target[propertyKey] : target);
  };

@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DeprecationInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const deprecationInfo = this.reflector.get(DEPRECATED_KEY, context.getHandler()) ||
                           this.reflector.get(DEPRECATED_KEY, context.getClass());

    if (deprecationInfo) {
      const response = context.switchToHttp().getResponse();
      const request = context.switchToHttp().getRequest();

      // Add deprecation headers
      response.setHeader('Deprecation', 'true');
      response.setHeader('Sunset', deprecationInfo.sunset || 'TBD');
      response.setHeader('Link', '<https://docs.householdplanet.co.ke/api/migration>; rel="successor-version"');

      // Log deprecation usage
      this.logger.warn(`Deprecated endpoint accessed: ${request.method} ${request.url}`, {
        version: deprecationInfo.version,
        sunset: deprecationInfo.sunset,
        userAgent: request.headers['user-agent'],
        ip: request.ip
      });
    }

    return next.handle();
  }
}