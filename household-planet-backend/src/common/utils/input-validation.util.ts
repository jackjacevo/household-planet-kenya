import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

export class InputValidationUtil {
  /**
   * Sanitize string input to prevent injection attacks
   */
  static sanitizeString(input: any, maxLength = 255): string {
    if (!input) return '';
    return String(input).trim().slice(0, maxLength);
  }

  /**
   * Validate and sanitize integer input
   */
  static validateInteger(input: any, min = 1, max = Number.MAX_SAFE_INTEGER): number {
    if (input === null || input === undefined || input === '') {
      throw new BadRequestException('Integer value is required');
    }
    const parsed = parseInt(String(input), 10);
    if (isNaN(parsed) || parsed < min || parsed > max) {
      throw new BadRequestException(`Invalid integer value: ${input}`);
    }
    return parsed;
  }

  /**
   * Safe parseInt with fallback
   */
  static safeParseInt(input: any, fallback = 0): number {
    if (input === null || input === undefined || input === '') {
      return fallback;
    }
    const parsed = parseInt(String(input), 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Validate and sanitize pagination parameters
   */
  static validatePagination(page: any, limit: any) {
    const validatedPage = Math.max(1, this.safeParseInt(page, 1));
    const validatedLimit = Math.min(100, Math.max(1, this.safeParseInt(limit, 20)));
    return { page: validatedPage, limit: validatedLimit };
  }

  /**
   * Sanitize filename to prevent path traversal
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) throw new BadRequestException('Filename is required');
    
    // Remove path separators and dangerous characters
    const sanitized = path.basename(filename).replace(/[^a-zA-Z0-9.-_]/g, '');
    
    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid filename');
    }
    
    if (!sanitized || sanitized.length === 0) {
      throw new BadRequestException('Invalid filename');
    }
    
    return sanitized;
  }

  /**
   * Validate file path is within allowed directory
   */
  static validateFilePath(filePath: string, allowedDir: string): void {
    const resolvedPath = path.resolve(filePath);
    const resolvedAllowedDir = path.resolve(allowedDir);
    
    if (!resolvedPath.startsWith(resolvedAllowedDir)) {
      throw new BadRequestException('File path not allowed');
    }
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: any, maxLength = 100): string {
    if (!query) return '';
    
    const sanitized = String(query)
      .trim()
      .slice(0, maxLength)
      .replace(/[<>\"'\\]/g, '') // Remove potentially dangerous characters
      .replace(/\$\w+/g, '') // Remove NoSQL operators
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    
    return sanitized;
  }

  /**
   * Sanitize JSON input before parsing
   */
  static sanitizeJsonInput(input: any): string {
    if (!input) return '';
    
    return String(input)
      .replace(/\$\w+/g, '') // Remove NoSQL operators
      .replace(/function\s*\(/gi, '') // Remove function declarations
      .replace(/eval\s*\(/gi, '') // Remove eval calls
      .replace(/javascript:/gi, ''); // Remove javascript: protocol
  }

  /**
   * Validate sort parameters
   */
  static validateSortParams(sortBy: any, sortOrder: any, allowedFields: string[]) {
    const sanitizedSortBy = this.sanitizeString(sortBy, 50);
    const sanitizedSortOrder = this.sanitizeString(sortOrder, 10);
    
    const validSortBy = allowedFields.includes(sanitizedSortBy) ? sanitizedSortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sanitizedSortOrder) ? sanitizedSortOrder : 'desc';
    
    return { sortBy: validSortBy, sortOrder: validSortOrder };
  }

  /**
   * Comprehensive input sanitization
   */
  static sanitizeInput(input: any, type: 'string' | 'number' | 'boolean' = 'string'): any {
    if (input === null || input === undefined) return null;
    
    switch (type) {
      case 'number':
        return this.safeParseInt(input);
      case 'boolean':
        return Boolean(input);
      default:
        return this.sanitizeString(input);
    }
  }
}