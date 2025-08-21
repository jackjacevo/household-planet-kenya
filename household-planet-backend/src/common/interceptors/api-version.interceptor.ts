import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { API_VERSION_KEY } from '../decorators/api-version.decorator';

@Injectable()
export class ApiVersionInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const requiredVersion = this.reflector.get<string>(API_VERSION_KEY, context.getHandler()) ||
                           this.reflector.get<string>(API_VERSION_KEY, context.getClass());

    if (requiredVersion) {
      const clientVersion = request.headers['api-version'] || request.query.version || 'v1';
      
      // Check version compatibility
      if (!this.isVersionCompatible(clientVersion, requiredVersion)) {
        throw new BadRequestException(`API version ${clientVersion} is not supported. Required: ${requiredVersion}`);
      }

      // Add version info to response headers
      response.setHeader('API-Version', requiredVersion);
      response.setHeader('API-Supported-Versions', 'v1, v2');
    }

    return next.handle();
  }

  private isVersionCompatible(clientVersion: string, requiredVersion: string): boolean {
    // Simple version compatibility check
    const clientMajor = parseInt(clientVersion.replace('v', ''));
    const requiredMajor = parseInt(requiredVersion.replace('v', ''));
    
    return clientMajor >= requiredMajor;
  }
}