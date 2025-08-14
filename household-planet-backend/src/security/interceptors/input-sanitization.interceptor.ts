import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InputSanitizerService } from '../input-sanitizer.service';

@Injectable()
export class InputSanitizationInterceptor implements NestInterceptor {
  constructor(private readonly sanitizer: InputSanitizerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Sanitize request body
    if (request.body && typeof request.body === 'object') {
      request.body = this.sanitizer.sanitizeUserInput(request.body);
    }
    
    // Sanitize query parameters
    if (request.query && typeof request.query === 'object') {
      request.query = this.sanitizer.sanitizeUserInput(request.query);
    }
    
    // Sanitize route parameters
    if (request.params && typeof request.params === 'object') {
      request.params = this.sanitizer.sanitizeUserInput(request.params);
    }

    return next.handle();
  }
}