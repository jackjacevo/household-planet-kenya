"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLoggingService = void 0;
const common_1 = require("@nestjs/common");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const log_sanitizer_service_1 = require("../security/log-sanitizer.service");
let ApiLoggingService = class ApiLoggingService {
    constructor() {
        this.logSanitizer = new log_sanitizer_service_1.LogSanitizerService();
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
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
        this.securityLogger = winston.createLogger({
            level: 'warn',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
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
    logRequest(req, res, responseTime) {
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
    logSecurityEvent(event, details, severity = 'medium') {
        const logData = {
            event: this.logSanitizer.sanitizeForLog(event),
            severity,
            details: this.logSanitizer.sanitizeObject(details),
            timestamp: new Date().toISOString(),
        };
        this.securityLogger.warn('Security Event', this.logSanitizer.sanitizeObject(logData));
    }
    logAuthAttempt(success, email, ip, userAgent) {
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
        }
        else {
            this.securityLogger.warn('Authentication Failure', sanitizedData);
        }
    }
    logRateLimitExceeded(ip, endpoint, limit) {
        this.logSecurityEvent('rate_limit_exceeded', {
            ip: this.logSanitizer.sanitizeForLog(ip),
            endpoint: this.logSanitizer.sanitizeForLog(endpoint),
            limit,
        }, 'medium');
    }
    logSuspiciousActivity(type, details) {
        this.logSecurityEvent('suspicious_activity', {
            type,
            ...details,
        }, 'high');
    }
    logFileUpload(userId, filename, size, mimeType, success) {
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
        }
        else {
            this.securityLogger.warn('File Upload Failure', sanitizedData);
        }
    }
    logDataAccess(userId, resource, action) {
        const logData = {
            event: 'data_access',
            userId: this.logSanitizer.sanitizeForLog(userId),
            resource: this.logSanitizer.sanitizeForLog(resource),
            action: this.logSanitizer.sanitizeForLog(action),
            timestamp: new Date().toISOString(),
        };
        this.logger.info('Data Access', this.logSanitizer.sanitizeObject(logData));
    }
};
exports.ApiLoggingService = ApiLoggingService;
exports.ApiLoggingService = ApiLoggingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ApiLoggingService);
//# sourceMappingURL=api-logging.service.js.map