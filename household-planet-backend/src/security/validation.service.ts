import { Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import * as validator from 'validator';

@Injectable()
export class ValidationService {
  
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return validator.escape(input)
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .trim();
  }

  sanitizeHtml(html: string): string {
    if (!html) return '';
    
    // Remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '');
  }

  validateEmail(email: string): boolean {
    return validator.isEmail(email) && 
           !this.containsSuspiciousPatterns(email) &&
           email.length <= 254;
  }

  validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '');
    return validator.isMobilePhone(cleanPhone, 'any') &&
           cleanPhone.length >= 10 &&
           cleanPhone.length <= 15;
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common, please choose a stronger password');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol) &&
             !this.containsSuspiciousPatterns(url);
    } catch {
      return false;
    }
  }

  validateFileUpload(filename: string, mimeType: string, size: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/csv', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }
    
    if (!allowedTypes.includes(mimeType)) {
      errors.push('File type not allowed');
    }
    
    if (this.containsSuspiciousPatterns(filename)) {
      errors.push('Filename contains suspicious characters');
    }
    
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs'];
    if (dangerousExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
      errors.push('File extension not allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    return validator.isCreditCard(cleaned);
  }

  validateAmount(amount: number): boolean {
    return typeof amount === 'number' &&
           amount > 0 &&
           amount <= 1000000 &&
           Number.isFinite(amount);
  }

  validateDateRange(startDate: Date, endDate: Date): boolean {
    const now = new Date();
    return startDate <= endDate &&
           startDate >= new Date(now.getFullYear() - 1, 0, 1) &&
           endDate <= new Date(now.getFullYear() + 1, 11, 31);
  }

  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /('|\(|;|\||\*|%|<|>|\^|\[|\]|\{|\}|\(|\))/g,
      /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
      /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i,
      /\b(WAITFOR|DELAY)\b/i,
      /\b(BENCHMARK|SLEEP)\b/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  private containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /[<>]/,  // HTML tags
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /on\w+=/i,
      /\0/,    // Null bytes
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/  // Control characters
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      'dragon', 'master', 'shadow', 'superman', 'michael'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }
}