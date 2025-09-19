import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method.toUpperCase();

    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const token = request.headers['x-csrf-token'] || request.body._csrf;
    const sessionToken = request.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
