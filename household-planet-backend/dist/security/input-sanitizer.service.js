"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputSanitizerService = void 0;
const common_1 = require("@nestjs/common");
const DOMPurify = require("isomorphic-dompurify");
let InputSanitizerService = class InputSanitizerService {
    sanitizeForDatabase(input) {
        if (typeof input === 'string') {
            return input
                .replace(/\$\w+/g, '')
                .replace(/[{}]/g, '')
                .replace(/[\[\]]/g, '')
                .trim();
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
                const cleanKey = key.replace(/\$\w+/g, '').replace(/[{}[\]]/g, '');
                if (cleanKey && cleanKey.length > 0) {
                    sanitized[cleanKey] = this.sanitizeForDatabase(value);
                }
            }
            return sanitized;
        }
        return input;
    }
    sanitizeForLogging(input) {
        if (typeof input !== 'string') {
            input = String(input);
        }
        return input
            .replace(/[\r\n\t]/g, ' ')
            .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
            .substring(0, 1000);
    }
    sanitizeHtml(input) {
        return DOMPurify.sanitize(input, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
            ALLOWED_ATTR: []
        });
    }
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/\.{2,}/g, '.')
            .replace(/^\.+|\.+$/g, '')
            .substring(0, 255);
    }
    sanitizeSearchQuery(query) {
        return query
            .replace(/[<>\"'%;()&+]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100);
    }
    sanitizeUserInput(input) {
        if (Array.isArray(input)) {
            return input.map(item => this.sanitizeUserInput(item));
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
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
    isValidKey(key) {
        return !key.startsWith('$') &&
            !key.includes('..') &&
            !key.includes('__proto__') &&
            !key.includes('constructor') &&
            key.length <= 100;
    }
    encodeForUrl(input) {
        return encodeURIComponent(input);
    }
    sanitizePhoneNumber(phone) {
        return phone.replace(/[^\d+\-\s()]/g, '').trim();
    }
    sanitizeEmail(email) {
        return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
    }
};
exports.InputSanitizerService = InputSanitizerService;
exports.InputSanitizerService = InputSanitizerService = __decorate([
    (0, common_1.Injectable)()
], InputSanitizerService);
//# sourceMappingURL=input-sanitizer.service.js.map