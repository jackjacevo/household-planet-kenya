import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiLoggingService } from '../api-logging.service';
export declare class ApiLoggingInterceptor implements NestInterceptor {
    private readonly apiLogging;
    constructor(apiLogging: ApiLoggingService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private isSensitiveEndpoint;
}
