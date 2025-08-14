import { Injectable } from '@nestjs/common';

@Injectable()
export class LogSanitizerService {
  private readonly dangerousPatterns = [
    /\r\n|\r|\n/g, // CRLF injection
    /\x00/g, // Null bytes
    /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
    /\u0000-\u001F/g, // Unicode control characters
    /\u007F-\u009F/g, // Additional control characters
    /\u2028|\u2029/g, // Line/paragraph separators
    /%0[aAdD]/gi, // URL-encoded CRLF
    /%00/gi, // URL-encoded null bytes
    /\\[rn]/gi, // Escaped newlines
    /\${.*?}/g, // Template literals
    /\$\(.*?\)/g, // Command substitution
    /`.*?`/g, // Backticks
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /data:.*?base64/gi, // Data URLs
  ];

  private readonly maxLength = 1000; // Maximum log entry length
  private readonly sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];

  sanitizeForLog(input: any): string {
    if (input === null || input === undefined) {
      return 'null';
    }

    let sanitized = String(input);

    // Truncate if too long
    if (sanitized.length > this.maxLength) {
      sanitized = sanitized.substring(0, this.maxLength) + '...[truncated]';
    }

    // Remove dangerous patterns
    this.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    });

    // Escape special characters for JSON safety
    sanitized = sanitized
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'");

    return sanitized;
  }

  sanitizeObject(obj: any, depth: number = 0): any {
    // Prevent infinite recursion
    if (depth > 5) {
      return '[MAX_DEPTH_REACHED]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeForLog(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      // Limit array size to prevent log flooding
      const limitedArray = obj.slice(0, 10);
      const sanitizedArray = limitedArray.map(item => this.sanitizeObject(item, depth + 1));
      if (obj.length > 10) {
        sanitizedArray.push(`[...${obj.length - 10} more items]`);
      }
      return sanitizedArray;
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      let fieldCount = 0;
      
      for (const [key, value] of Object.entries(obj)) {
        // Limit object fields to prevent log flooding
        if (fieldCount >= 20) {
          sanitized['[MORE_FIELDS]'] = `${Object.keys(obj).length - 20} additional fields`;
          break;
        }
        
        const sanitizedKey = this.sanitizeForLog(key);
        
        // Mask sensitive fields
        if (this.isSensitiveField(key)) {
          sanitized[sanitizedKey] = '[REDACTED]';
        } else {
          sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
        }
        
        fieldCount++;
      }
      return sanitized;
    }

    return this.sanitizeForLog(obj);
  }

  sanitizeUserInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[\\]/g, '') // Remove backslashes
      .replace(/[\r\n]/g, ' ') // Replace line breaks with spaces
      .trim()
      .substring(0, 200); // Limit length
  }

  /**
   * Check if a field name indicates sensitive data
   */
  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.sensitiveFields.some(sensitive => lowerField.includes(sensitive));
  }

  /**
   * Sanitize error messages for logging
   */
  sanitizeError(error: any): any {
    if (!error) return null;
    
    const sanitized: any = {
      message: this.sanitizeForLog(error.message || 'Unknown error'),
      name: this.sanitizeForLog(error.name || 'Error'),
    };
    
    // Include stack trace only in development
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      sanitized.stack = this.sanitizeForLog(error.stack);
    }
    
    return sanitized;
  }

  /**
   * Sanitize HTTP request data for logging
   */
  sanitizeRequest(req: any): any {
    return {
      method: this.sanitizeForLog(req.method),
      url: this.sanitizeForLog(req.url),
      userAgent: this.sanitizeForLog(req.headers?.['user-agent']),
      ip: this.sanitizeForLog(req.ip || req.connection?.remoteAddress),
      timestamp: new Date().toISOString()
    };
  }
}