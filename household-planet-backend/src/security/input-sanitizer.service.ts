import { Injectable } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class InputSanitizerService {
  
  /**
   * Sanitize user input to prevent NoSQL injection
   */
  sanitizeForDatabase(input: any): any {
    if (typeof input === 'string') {
      // Remove potential NoSQL operators and escape special characters
      return input
        .replace(/\$\w+/g, '') // Remove MongoDB operators like $where, $ne, etc.
        .replace(/[{}]/g, '') // Remove curly braces
        .replace(/[\[\]]/g, '') // Remove square brackets
        .trim();
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        // Sanitize keys to prevent injection
        const cleanKey = key.replace(/\$\w+/g, '').replace(/[{}[\]]/g, '');
        if (cleanKey && cleanKey.length > 0) {
          sanitized[cleanKey] = this.sanitizeForDatabase(value);
        }
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Sanitize input for logging to prevent log injection
   */
  sanitizeForLogging(input: string): string {
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    return input
      .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs with spaces
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .substring(0, 1000); // Limit length to prevent log flooding
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  /**
   * Sanitize filename to prevent path traversal
   */
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .substring(0, 255); // Limit filename length
  }

  /**
   * Validate and sanitize search query
   */
  sanitizeSearchQuery(query: string): string {
    return query
      .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit query length
  }

  /**
   * Sanitize user input for safe database queries
   */
  sanitizeUserInput(input: any): any {
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeUserInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        // Validate key names
        if (this.isValidKey(key)) {
          sanitized[key] = this.sanitizeUserInput(value);
        }
      }
      return sanitized;
    }
    
    if (typeof input === 'string') {
      return this.sanitizeForDatabase(input);
    }
    
    return input;
  }

  /**
   * Check if a key is valid and safe
   */
  private isValidKey(key: string): boolean {
    // Reject keys that start with $ or contain dangerous patterns
    return !key.startsWith('$') && 
           !key.includes('..') && 
           !key.includes('__proto__') &&
           !key.includes('constructor') &&
           key.length <= 100;
  }

  /**
   * Encode data for safe URL usage
   */
  encodeForUrl(input: string): string {
    return encodeURIComponent(input);
  }

  /**
   * Sanitize phone number
   */
  sanitizePhoneNumber(phone: string): string {
    return phone.replace(/[^\d+\-\s()]/g, '').trim();
  }

  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): string {
    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
  }
}