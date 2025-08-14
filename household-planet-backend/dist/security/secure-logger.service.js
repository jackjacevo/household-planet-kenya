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
var SecureLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureLoggerService = void 0;
const common_1 = require("@nestjs/common");
const input_sanitizer_service_1 = require("./input-sanitizer.service");
let SecureLoggerService = SecureLoggerService_1 = class SecureLoggerService {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.logger = new common_1.Logger(SecureLoggerService_1.name);
    }
    info(message, userInput, context) {
        const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
        const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
        this.logger.log(`${sanitizedMessage} ${sanitizedInput}`, context);
    }
    error(message, error, userInput, context) {
        const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
        const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
        this.logger.error(`${sanitizedMessage} ${sanitizedInput}`, error?.stack, context);
    }
    warn(message, userInput, context) {
        const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
        const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
        this.logger.warn(`${sanitizedMessage} ${sanitizedInput}`, context);
    }
    debug(message, userInput, context) {
        const sanitizedMessage = this.sanitizer.sanitizeForLogging(message);
        const sanitizedInput = userInput ? this.sanitizer.sanitizeForLogging(JSON.stringify(userInput)) : '';
        this.logger.debug(`${sanitizedMessage} ${sanitizedInput}`, context);
    }
    security(event, details, userId, ip) {
        const sanitizedEvent = this.sanitizer.sanitizeForLogging(event);
        const sanitizedDetails = this.sanitizer.sanitizeForLogging(JSON.stringify(details));
        const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
        const sanitizedIp = ip ? this.sanitizer.sanitizeForLogging(ip) : 'unknown';
        this.logger.warn(`SECURITY_EVENT: ${sanitizedEvent} | User: ${sanitizedUserId} | IP: ${sanitizedIp} | Details: ${sanitizedDetails}`, 'SecurityLogger');
    }
    auth(event, userId, ip, userAgent) {
        const sanitizedEvent = this.sanitizer.sanitizeForLogging(event);
        const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
        const sanitizedIp = ip ? this.sanitizer.sanitizeForLogging(ip) : 'unknown';
        const sanitizedUserAgent = userAgent ? this.sanitizer.sanitizeForLogging(userAgent) : 'unknown';
        this.logger.log(`AUTH_EVENT: ${sanitizedEvent} | User: ${sanitizedUserId} | IP: ${sanitizedIp} | UserAgent: ${sanitizedUserAgent}`, 'AuthLogger');
    }
    api(method, url, userId, ip, responseTime) {
        const sanitizedMethod = this.sanitizer.sanitizeForLogging(method);
        const sanitizedUrl = this.sanitizer.sanitizeForLogging(url);
        const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
        const sanitizedIp = ip ? this.sanitizer.sanitizeForLogging(ip) : 'unknown';
        this.logger.log(`API_ACCESS: ${sanitizedMethod} ${sanitizedUrl} | User: ${sanitizedUserId} | IP: ${sanitizedIp} | Time: ${responseTime}ms`, 'ApiLogger');
    }
    file(operation, filename, userId, success = true) {
        const sanitizedOperation = this.sanitizer.sanitizeForLogging(operation);
        const sanitizedFilename = this.sanitizer.sanitizeFilename(filename);
        const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'anonymous';
        const status = success ? 'SUCCESS' : 'FAILED';
        this.logger.log(`FILE_OPERATION: ${sanitizedOperation} | File: ${sanitizedFilename} | User: ${sanitizedUserId} | Status: ${status}`, 'FileLogger');
    }
    database(operation, table, userId, recordId) {
        const sanitizedOperation = this.sanitizer.sanitizeForLogging(operation);
        const sanitizedTable = this.sanitizer.sanitizeForLogging(table);
        const sanitizedUserId = userId ? this.sanitizer.sanitizeForLogging(userId) : 'system';
        const sanitizedRecordId = recordId ? this.sanitizer.sanitizeForLogging(recordId) : 'N/A';
        this.logger.debug(`DB_OPERATION: ${sanitizedOperation} | Table: ${sanitizedTable} | User: ${sanitizedUserId} | Record: ${sanitizedRecordId}`, 'DatabaseLogger');
    }
};
exports.SecureLoggerService = SecureLoggerService;
exports.SecureLoggerService = SecureLoggerService = SecureLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [input_sanitizer_service_1.InputSanitizerService])
], SecureLoggerService);
//# sourceMappingURL=secure-logger.service.js.map