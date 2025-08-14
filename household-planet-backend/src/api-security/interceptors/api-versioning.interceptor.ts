import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiVersioningService } from '../api-versioning.service';

@Injectable()
export class ApiVersioningInterceptor implements NestInterceptor {
  constructor(private readonly apiVersioning: ApiVersioningService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get API version from request
    const version = this.apiVersioning.getVersionFromRequest(request);
    
    // Validate version
    this.apiVersioning.validateVersion(version);

    // Add deprecation headers if needed
    this.apiVersioning.addDeprecationHeaders(response, version);

    // Add version header to response
    response.setHeader('X-API-Version', version);

    return next.handle().pipe(
      map(data => {
        // Transform response based on version
        return this.apiVersioning.transformResponseForVersion(data, version);
      })
    );
  }
}