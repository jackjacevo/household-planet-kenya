"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogSanitizerService = void 0;
const common_1 = require("@nestjs/common");
let LogSanitizerService = class LogSanitizerService {
    constructor() {
        this.dangerousPatterns = [
            /\r\n|\r|\n/g,
            /\x00/g,
            /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
            /\u0000-\u001F/g,
            /\u007F-\u009F/g,
            /\u2028|\u2029/g,
            /%0[aAdD]/gi,
            /%00/gi,
            /\\[rn]/gi,
            /\${.*?}/g,
            /\$\(.*?\)/g,
            /`.*?`/g,
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /data:.*?base64/gi,
        ];
        this.maxLength = 1000;
        this.sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    }
    sanitizeForLog(input) {
        if (input === null || input === undefined) {
            return 'null';
        }
        let sanitized = String(input);
        if (sanitized.length > this.maxLength) {
            sanitized = sanitized.substring(0, this.maxLength) + '...[truncated]';
        }
        this.dangerousPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '[FILTERED]');
        });
        sanitized = sanitized
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
        return sanitized;
    }
    sanitizeObject(obj, depth = 0) {
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
            const limitedArray = obj.slice(0, 10);
            const sanitizedArray = limitedArray.map(item => this.sanitizeObject(item, depth + 1));
            if (obj.length > 10) {
                sanitizedArray.push(`[...${obj.length - 10} more items]`);
            }
            return sanitizedArray;
        }
        if (typeof obj === 'object') {
            const sanitized = {};
            let fieldCount = 0;
            for (const [key, value] of Object.entries(obj)) {
                if (fieldCount >= 20) {
                    sanitized['[MORE_FIELDS]'] = `${Object.keys(obj).length - 20} additional fields`;
                    break;
                }
                const sanitizedKey = this.sanitizeForLog(key);
                if (this.isSensitiveField(key)) {
                    sanitized[sanitizedKey] = '[REDACTED]';
                }
                else {
                    sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
                }
                fieldCount++;
            }
            return sanitized;
        }
        return this.sanitizeForLog(obj);
    }
    sanitizeUserInput(input) {
        if (!input)
            return '';
        return input
            .replace(/[<>]/g, '')
            .replace(/['"]/g, '')
            .replace(/[\\]/g, '')
            .replace(/[\r\n]/g, ' ')
            .trim()
            .substring(0, 200);
    }
    isSensitiveField(fieldName) {
        const lowerField = fieldName.toLowerCase();
        return this.sensitiveFields.some(sensitive => lowerField.includes(sensitive));
    }
    sanitizeError(error) {
        if (!error)
            return null;
        const sanitized = {
            message: this.sanitizeForLog(error.message || 'Unknown error'),
            name: this.sanitizeForLog(error.name || 'Error'),
        };
        if (process.env.NODE_ENV !== 'production' && error.stack) {
            sanitized.stack = this.sanitizeForLog(error.stack);
        }
        return sanitized;
    }
    sanitizeRequest(req) {
        return {
            method: this.sanitizeForLog(req.method),
            url: this.sanitizeForLog(req.url),
            userAgent: this.sanitizeForLog(req.headers?.['user-agent']),
            ip: this.sanitizeForLog(req.ip || req.connection?.remoteAddress),
            timestamp: new Date().toISOString()
        };
    }
};
exports.LogSanitizerService = LogSanitizerService;
exports.LogSanitizerService = LogSanitizerService = __decorate([
    (0, common_1.Injectable)()
], LogSanitizerService);
//# sourceMappingURL=log-sanitizer.service.js.map