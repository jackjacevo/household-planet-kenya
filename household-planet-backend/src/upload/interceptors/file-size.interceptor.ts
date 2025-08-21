import { Injectable, NestInterceptor, ExecutionContext, CallHandler, PayloadTooLargeException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileSizeInterceptor implements NestInterceptor {
  constructor(private readonly maxSize: number = 10 * 1024 * 1024) {} // 10MB default

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.file && request.file.size > this.maxSize) {
      throw new PayloadTooLargeException('File size exceeds maximum allowed size');
    }

    return next.handle();
  }
}