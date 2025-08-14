import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiVersioningService } from '../api-versioning.service';
export declare class ApiVersioningInterceptor implements NestInterceptor {
    private readonly apiVersioning;
    constructor(apiVersioning: ApiVersioningService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
