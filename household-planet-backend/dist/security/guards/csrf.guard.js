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
var CsrfGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const csrf_protection_service_1 = require("../csrf-protection.service");
const secure_logger_service_1 = require("../secure-logger.service");
const skip_csrf_decorator_1 = require("../decorators/skip-csrf.decorator");
let CsrfGuard = CsrfGuard_1 = class CsrfGuard {
    constructor(csrfService, secureLogger, reflector) {
        this.csrfService = csrfService;
        this.secureLogger = secureLogger;
        this.reflector = reflector;
        this.logger = new common_1.Logger(CsrfGuard_1.name);
    }
    canActivate(context) {
        const skipCsrf = this.reflector.getAllAndOverride(skip_csrf_decorator_1.SKIP_CSRF_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipCsrf) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const method = request.method.toLowerCase();
        const userAgent = request.headers['user-agent'];
        const ip = this.getClientIp(request);
        const userId = request.user?.id;
        if (!['post', 'put', 'patch', 'delete'].includes(method)) {
            return true;
        }
        if (this.isApiEndpoint(request)) {
            const cookieToken = request.cookies?.['csrf-token'];
            const headerToken = request.headers['x-csrf-token'];
            if (cookieToken && headerToken) {
                const isValidDoubleSubmit = this.csrfService.validateDoubleSubmitToken(cookieToken, headerToken);
                if (isValidDoubleSubmit) {
                    return true;
                }
            }
            if (this.hasValidApiAuth(request)) {
                if (!this.validateOrigin(request)) {
                    this.secureLogger.security('CSRF_ORIGIN_MISMATCH', {
                        method,
                        url: request.url,
                        origin: request.headers.origin,
                        referer: request.headers.referer
                    }, userId, ip);
                    throw new common_1.ForbiddenException('Invalid request origin');
                }
                return true;
            }
        }
        const sessionId = this.getSessionId(request);
        const csrfToken = this.getCsrfToken(request);
        if (!sessionId) {
            this.secureLogger.security('CSRF_NO_SESSION', {
                method,
                url: request.url,
                userAgent
            }, userId, ip);
            throw new common_1.ForbiddenException('Session required for CSRF protection');
        }
        if (!csrfToken) {
            this.secureLogger.security('CSRF_TOKEN_MISSING', {
                method,
                url: request.url,
                sessionId: sessionId.substring(0, 8) + '...'
            }, userId, ip);
            throw new common_1.ForbiddenException('CSRF token required');
        }
        const isValid = this.csrfService.validateToken(sessionId, csrfToken);
        if (!isValid) {
            this.secureLogger.security('CSRF_TOKEN_INVALID', {
                method,
                url: request.url,
                sessionId: sessionId.substring(0, 8) + '...',
                tokenLength: csrfToken.length
            }, userId, ip);
            throw new common_1.ForbiddenException('Invalid CSRF token');
        }
        return true;
    }
    isApiEndpoint(request) {
        return request.url.startsWith('/api/');
    }
    hasValidApiAuth(request) {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }
        const token = authHeader.substring(7);
        return token.length > 20 && /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token);
    }
    validateOrigin(request) {
        const origin = request.headers.origin;
        const referer = request.headers.referer;
        const host = request.headers.host;
        if (origin && origin.includes(host)) {
            return true;
        }
        if (referer && referer.includes(host)) {
            return true;
        }
        const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [];
        return trustedOrigins.some(trusted => origin?.includes(trusted));
    }
    getClientIp(request) {
        return request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            'unknown';
    }
    getSessionId(request) {
        return request.session?.id ||
            request.cookies?.sessionId ||
            request.headers['x-session-id'] ||
            null;
    }
    getCsrfToken(request) {
        return request.headers['x-csrf-token'] ||
            request.headers['x-xsrf-token'] ||
            request.body?._csrf ||
            request.query?._csrf ||
            null;
    }
};
exports.CsrfGuard = CsrfGuard;
exports.CsrfGuard = CsrfGuard = CsrfGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csrf_protection_service_1.CsrfProtectionService,
        secure_logger_service_1.SecureLoggerService,
        core_1.Reflector])
], CsrfGuard);
//# sourceMappingURL=csrf.guard.js.map