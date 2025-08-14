import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InputSanitizerService } from '../input-sanitizer.service';
export declare class InputSanitizationInterceptor implements NestInterceptor {
    private readonly sanitizer;
    constructor(sanitizer: InputSanitizerService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
