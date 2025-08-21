import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger(SecurityGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auditLog = this.reflector.get<boolean>('auditLog', context.getHandler());
    
    // Log security-sensitive operations
    if (auditLog) {
      this.logger.log(`Security audit: ${request.method} ${request.url} - User: ${request.user?.userId || 'anonymous'} - IP: ${request.ip}`);
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//,  // Path traversal
      /<script/i, // XSS
      /union.*select/i, // SQL injection
    ];

    const requestData = JSON.stringify({
      body: request.body,
      query: request.query,
      params: request.params,
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestData)) {
        this.logger.warn(`Suspicious request blocked: ${request.ip} - Pattern: ${pattern}`);
        return false;
      }
    }

    return true;
  }
}