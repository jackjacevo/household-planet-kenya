"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityValidationService = void 0;
const common_1 = require("@nestjs/common");
let SecurityValidationService = class SecurityValidationService {
    validateHttpsInProduction(req) {
        if (process.env.NODE_ENV === 'production') {
            const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
            if (!isHttps) {
                return false;
            }
        }
        return true;
    }
    validateCsrfToken(req) {
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return true;
        }
        const token = req.get('X-CSRF-Token') || req.body?._csrf;
        return !!token;
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        delete sanitized.authorization;
        delete sanitized.cookie;
        delete sanitized['x-csrf-token'];
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string') {
                sanitized[key] = sanitized[key]
                    .replace(/[\r\n]/g, '')
                    .substring(0, 200);
            }
        });
        return sanitized;
    }
    isSecureEndpoint(url) {
        const securePatterns = [
            '/api/auth',
            '/api/payments',
            '/api/admin',
            '/api/users/profile',
            '/api/orders'
        ];
        return securePatterns.some(pattern => url.includes(pattern));
    }
};
exports.SecurityValidationService = SecurityValidationService;
exports.SecurityValidationService = SecurityValidationService = __decorate([
    (0, common_1.Injectable)()
], SecurityValidationService);
//# sourceMappingURL=security-validation.service.js.map