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
exports.ApiLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const api_logging_service_1 = require("../api-logging.service");
let ApiLoggingInterceptor = class ApiLoggingInterceptor {
    constructor(apiLogging) {
        this.apiLogging = apiLogging;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const responseTime = Date.now() - startTime;
                this.apiLogging.logRequest(request, response, responseTime);
                if (this.isSensitiveEndpoint(request.url)) {
                    this.apiLogging.logDataAccess(request.user?.id || 'anonymous', request.url, request.method);
                }
            },
            error: (error) => {
                const responseTime = Date.now() - startTime;
                this.apiLogging.logRequest(request, response, responseTime);
                if (error.status === 401 || error.status === 403) {
                    this.apiLogging.logSecurityEvent('unauthorized_access', {
                        url: request.url,
                        method: request.method,
                        ip: request.ip,
                        userAgent: request.get('User-Agent'),
                        userId: request.user?.id,
                    });
                }
            },
        }));
    }
    isSensitiveEndpoint(url) {
        const sensitivePatterns = [
            '/api/users',
            '/api/admin',
            '/api/payments',
            '/api/orders',
            '/api/auth',
        ];
        return sensitivePatterns.some(pattern => url.includes(pattern));
    }
};
exports.ApiLoggingInterceptor = ApiLoggingInterceptor;
exports.ApiLoggingInterceptor = ApiLoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_logging_service_1.ApiLoggingService])
], ApiLoggingInterceptor);
//# sourceMappingURL=api-logging.interceptor.js.map