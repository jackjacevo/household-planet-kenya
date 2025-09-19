import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validate and sanitize query parameters
    this.sanitizeQueryParams(req);
    
    // Validate request body size
    this.validateRequestSize(req);
    
    // Check for suspicious patterns
    this.checkSuspiciousPatterns(req);
    
    next();
  }

  private sanitizeQueryParams(req: Request) {
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          // Check for NoSQL injection patterns
          if (this.containsNoSQLInjection(value)) {
            throw new BadRequestException(`Invalid query parameter: ${key}`);
          }
          
          // Check for path traversal patterns
          if (this.containsPathTraversal(value)) {
            throw new BadRequestException(`Invalid query parameter: ${key}`);
          }
        }
      }
    }
  }

  private validateRequestSize(req: Request) {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      throw new BadRequestException('Request too large');
    }
  }

  private checkSuspiciousPatterns(req: Request) {
    const userAgent = req.headers['user-agent'];
    if (userAgent && this.isSuspiciousUserAgent(userAgent)) {
      throw new BadRequestException('Suspicious request detected');
    }
  }

  private containsNoSQLInjection(value: string): boolean {
    const patterns = [
      /\$where/i,
      /\$ne/i,
      /\$gt/i,
      /\$lt/i,
      /\$regex/i,
      /\$or/i,
      /\$and/i,
      /\$in/i,
      /\$nin/i,
      /javascript:/i,
      /eval\(/i,
      /function\(/i
    ];
    
    return patterns.some(pattern => pattern.test(value));
  }

  private containsPathTraversal(value: string): boolean {
    const patterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
      /\.\.%2f/i,
      /\.\.%5c/i
    ];
    
    return patterns.some(pattern => pattern.test(value));
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /burp/i,
      /nmap/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
}
