import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { LogSanitizerService } from '../security/log-sanitizer.service';

@Injectable()
export class ApiLoggingService {
  private readonly logger: winston.Logger;
  private readonly securityLogger: winston.Logger;

  private readonly logSanitizer = new LogSanitizerService();

  constructor() {
    // Main API logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/api-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ],
    });

    // Security-specific logger
    this.securityLogger = winston.createLogger({
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });
  }

  logRequest(req: any, res: any, responseTime: number): void {
    const logData = {
      method: this.logSanitizer.sanitizeForLog(req.method),
      url: this.logSanitizer.sanitizeForLog(req.url),
      userAgent: this.logSanitizer.sanitizeForLog(req.get('User-Agent')),
      ip: this.logSanitizer.sanitizeForLog(req.ip),
      userId: this.logSanitizer.sanitizeForLog(req.user?.id),
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('API Request', this.logSanitizer.sanitizeObject(logData));
  }

  logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const logData = {
      event: this.logSanitizer.sanitizeForLog(event),
      severity,
      details: this.logSanitizer.sanitizeObject(details),
      timestamp: new Date().toISOString(),
    };

    this.securityLogger.warn('Security Event', this.logSanitizer.sanitizeObject(logData));
  }

  logAuthAttempt(success: boolean, email: string, ip: string, userAgent: string): void {
    const logData = {
      event: 'auth_attempt',
      success,
      email: this.logSanitizer.sanitizeUserInput(email),
      ip: this.logSanitizer.sanitizeForLog(ip),
      userAgent: this.logSanitizer.sanitizeForLog(userAgent),
      timestamp: new Date().toISOString(),
    };

    const sanitizedData = this.logSanitizer.sanitizeObject(logData);
    if (success) {
      this.logger.info('Authentication Success', sanitizedData);
    } else {
      this.securityLogger.warn('Authentication Failure', sanitizedData);
    }
  }

  logRateLimitExceeded(ip: string, endpoint: string, limit: number): void {
    this.logSecurityEvent('rate_limit_exceeded', {
      ip: this.logSanitizer.sanitizeForLog(ip),
      endpoint: this.logSanitizer.sanitizeForLog(endpoint),
      limit,
    }, 'medium');
  }

  logSuspiciousActivity(type: string, details: any): void {
    this.logSecurityEvent('suspicious_activity', {
      type,
      ...details,
    }, 'high');
  }

  logFileUpload(userId: string, filename: string, size: number, mimeType: string, success: boolean): void {
    const logData = {
      event: 'file_upload',
      userId: this.logSanitizer.sanitizeForLog(userId),
      filename: this.logSanitizer.sanitizeUserInput(filename),
      size,
      mimeType: this.logSanitizer.sanitizeForLog(mimeType),
      success,
      timestamp: new Date().toISOString(),
    };

    const sanitizedData = this.logSanitizer.sanitizeObject(logData);
    if (success) {
      this.logger.info('File Upload Success', sanitizedData);
    } else {
      this.securityLogger.warn('File Upload Failure', sanitizedData);
    }
  }

  logDataAccess(userId: string, resource: string, action: string): void {
    const logData = {
      event: 'data_access',
      userId: this.logSanitizer.sanitizeForLog(userId),
      resource: this.logSanitizer.sanitizeForLog(resource),
      action: this.logSanitizer.sanitizeForLog(action),
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Data Access', this.logSanitizer.sanitizeObject(logData));
  }
}