"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorsConfigService = void 0;
const common_1 = require("@nestjs/common");
let CorsConfigService = class CorsConfigService {
    constructor() {
        this.allowedOrigins = this.getAllowedOrigins();
        this.allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        this.allowedHeaders = [
            'Content-Type',
            'Authorization',
            'X-CSRF-Token',
            'X-Session-ID',
            'X-API-Version',
            'X-Requested-With',
        ];
    }
    getCorsOptions() {
        return {
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                if (this.isOriginAllowed(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error(`Origin ${origin} not allowed by CORS policy`));
                }
            },
            methods: this.allowedMethods,
            allowedHeaders: this.allowedHeaders,
            exposedHeaders: ['X-CSRF-Token', 'X-API-Version', 'X-Rate-Limit-Remaining'],
            credentials: true,
            maxAge: 86400,
            preflightContinue: false,
            optionsSuccessStatus: 204,
        };
    }
    getAllowedOrigins() {
        const baseOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
        ];
        if (process.env.NODE_ENV === 'production') {
            return [
                'https://householdplanetkenya.com',
                'https://www.householdplanetkenya.com',
                'https://admin.householdplanetkenya.com',
                ...this.getEnvironmentOrigins(),
            ];
        }
        return [...baseOrigins, ...this.getEnvironmentOrigins()];
    }
    getEnvironmentOrigins() {
        const envOrigins = process.env.ALLOWED_ORIGINS;
        if (!envOrigins) {
            return [];
        }
        return envOrigins.split(',').map(origin => origin.trim());
    }
    isOriginAllowed(origin) {
        if (this.allowedOrigins.includes(origin)) {
            return true;
        }
        if (process.env.NODE_ENV === 'production') {
            const allowedPatterns = [
                /^https:\/\/[\w-]+\.householdplanetkenya\.com$/,
            ];
            return allowedPatterns.some(pattern => pattern.test(origin));
        }
        if (process.env.NODE_ENV === 'development') {
            const devPatterns = [
                /^http:\/\/localhost:\d+$/,
                /^http:\/\/127\.0\.0\.1:\d+$/,
            ];
            return devPatterns.some(pattern => pattern.test(origin));
        }
        return false;
    }
    validateOrigin(origin) {
        return this.isOriginAllowed(origin);
    }
    getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        };
    }
};
exports.CorsConfigService = CorsConfigService;
exports.CorsConfigService = CorsConfigService = __decorate([
    (0, common_1.Injectable)()
], CorsConfigService);
//# sourceMappingURL=cors-config.service.js.map