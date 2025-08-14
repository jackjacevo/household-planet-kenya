import { Injectable, Logger } from '@nestjs/common';
import { InputSanitizerService } from './input-sanitizer.service';

@Injectable()
export class SecureLoggerService {
  private readonly logger = new Logger(SecureLoggerService.name);

  constructor(private readonly sanitizer: InputSanitizerService) {}

  /**
   * Log info with sanitized user input
   */
  info(message: string, userInput?: any, context?: string): void {
    const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
    const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
    
    this.logger.log(`${sanitizedMessage} ${sanitizedInput}`, context);
  }

  /**
   * Log error with sanitized user input
   */
  error(message: string, error?: any, userInput?: any, context?: string): void {
    const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
    const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
    
    this.logger.error(`${sanitizedMessage} ${sanitizedInput}`, error?.stack, context);
  }

  /**
   * Log warning with sanitized user input
   */
  warn(message: string, userInput?: any, context?: string): void {
    const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
    const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
    
    this.logger.warn(`${sanitizedMessage} ${sanitizedInput}`, context);
  }

  /**
   * Log debug with sanitized user input
   */
  debug(message: string, userInput?: any, context?: string): void {
    const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
    const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
    
    this.logger.debug(`${sanitizedMessage} ${sanitizedInput}`, context);
  }

  /**
   * Log security events
   */
  security(event: string, details: any, userId?: string, ip?: string): void {
    const sanitizedEvent = this.sanitizer.sanitizeForLogging(event);
    const sanitizedDetails = this.sanitizer.sanitizeForLogging(JSON.stringify(details));
    const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
    const sanitizedIp = ip ? this.sanitizer.sanitizeForLogging(ip) : 'unknown';
    
    this.logger.warn(
      `SECURITY_EVENT: ${sanitizedEvent} | User: ${sanitizedUserId} | IP: ${sanitizedIp} | Details: ${sanitizedDetails}`,
      'SecurityLogger'
    );
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, ip?: string, userAgent?: string): void {
    const sanitizedEvent = this.sanitizer.sanitizeForLogging(event);
    const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
    const sanitizedIp = ip ? this.sanitizer.sanitizeForLogging(ip) : 'unknown';
    const sanitizedUserAgent = userAgent ? this.sanitizer.sanitizeForLogging(userAgent) : 'unknown';
    
    this.logger.log(
      `AUTH_EVENT: ${sanitizedEvent} | User: ${sanitizedUserId} | IP: ${sanitizedIp} | UserAgent: ${sanitizedUserAgent}`,
      'AuthLogger'
    );
  }

  /**
   * Log API access
   */
  api(method: string, url: string, userId?: string, ip?: string, responseTime?: number): void {
    const sanitizedMethod = this.sanitizer.sanitizeForLogging(method);
    const sanitizedUrl = this.sanitizer.sanitizeForLogging(url);
    const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
    const sanitizedIp = ip ? this.sanitizer.sanitizeForLogging(ip) : 'unknown';
    
    this.logger.log(
      `API_ACCESS: ${sanitizedMethod} ${sanitizedUrl} | User: ${sanitizedUserId} | IP: ${sanitizedIp} | Time: ${responseTime}ms`,
      'ApiLogger'
    );
  }

  /**
   * Log file operations
   */
  file(operation: string, filename: string, userId?: string, success: boolean = true): void {
    const sanitizedOperation = this.sanitizer.sanitizeForLogging(operation);
    const sanitizedFilename = this.sanitizer.sanitizeFilename(filename);
    const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
    const status = success ? 'SUCCESS' : 'FAILED';
    
    this.logger.log(
      `FILE_OPERATION: ${sanitizedOperation} | File: ${sanitizedFilename} | User: ${sanitizedUserId} | Status: ${status}`,
      'FileLogger'
    );
  }

  /**
   * Log database operations
   */
  database(operation: string, table: string, userId?: string, recordId?: string): void {
    const sanitizedOperation = this.sanitizer.sanitizeForLogging(operation);
    const sanitizedTable = this.sanitizer.sanitizeForLogging(table);
    const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'system';
    const sanitizedRecordId = recordId ? this.sanitizer.sanitizeForLogging(recordId) : 'N/A';
    
    this.logger.debug(
      `DB_OPERATION: ${sanitizedOperation} | Table: ${sanitizedTable} | User: ${sanitizedUserId} | Record: ${sanitizedRecordId}`,
      'DatabaseLogger'
    );
  }
}