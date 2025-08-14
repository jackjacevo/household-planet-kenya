import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { SecurityService } from '../security.service';
import { ValidationService } from '../validation.service';

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private securityService: SecurityService,
    private validationService: ValidationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check for SQL injection attempts
    this.checkSQLInjection(request);
    
    // Check for XSS attempts
    this.checkXSS(request);
    
    // Validate and sanitize input
    this.sanitizeRequest(request);
    
    // Check for suspicious patterns
    this.checkSuspiciousActivity(request);
    
    return true;
  }

  private checkSQLInjection(request: Request): void {
    const checkData = (data: any, path: string = '') => {
      if (typeof data === 'string') {
        if (this.validationService.detectSQLInjection(data)) {
          this.securityService.logSecurityEvent('SQL_INJECTION_ATTEMPT', {
            path,
            data: data.substring(0, 100),
            ip: request.ip,
            userAgent: request.get('User-Agent')
          });
          throw new BadRequestException('Invalid input detected');
        }
      } else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(key => {
          checkData(data[key], `${path}.${key}`);
        });
      }
    };

    checkData(request.query, 'query');
    checkData(request.body, 'body');
    checkData(request.params, 'params');
  }

  private checkXSS(request: Request): void {
    const checkData = (data: any, path: string = '') => {
      if (typeof data === 'string') {
        if (this.validationService.detectXSS(data)) {
          this.securityService.logSecurityEvent('XSS_ATTEMPT', {
            path,
            data: data.substring(0, 100),
            ip: request.ip,
            userAgent: request.get('User-Agent')
          });
          throw new BadRequestException('Invalid input detected');
        }
      } else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(key => {
          checkData(data[key], `${path}.${key}`);
        });
      }
    };

    checkData(request.query, 'query');
    checkData(request.body, 'body');
  }

  private sanitizeRequest(request: Request): void {
    const sanitizeData = (data: any): any => {
      if (typeof data === 'string') {
        return this.validationService.sanitizeInput(data);
      } else if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
      } else if (typeof data === 'object' && data !== null) {
        const sanitized: any = {};
        Object.keys(data).forEach(key => {
          sanitized[key] = sanitizeData(data[key]);
        });
        return sanitized;
      }
      return data;
    };

    if (request.body) {
      request.body = sanitizeData(request.body);
    }
    if (request.query) {
      request.query = sanitizeData(request.query);
    }
  }

  private checkSuspiciousActivity(request: Request): void {
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-cluster-client-ip'
    ];

    // Check for header injection
    Object.keys(request.headers).forEach(header => {
      const value = request.headers[header];
      if (typeof value === 'string' && (value.includes('\n') || value.includes('\r'))) {
        this.securityService.logSecurityEvent('HEADER_INJECTION_ATTEMPT', {
          header,
          value: value.substring(0, 100),
          ip: request.ip
        });
        throw new BadRequestException('Invalid header detected');
      }
    });

    // Check for suspicious user agents
    const userAgent = request.get('User-Agent') || '';
    const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap'];
    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      this.securityService.logSecurityEvent('SUSPICIOUS_USER_AGENT', {
        userAgent,
        ip: request.ip
      });
      throw new ForbiddenException('Access denied');
    }
  }
}