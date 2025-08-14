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
exports.SecurityGuard = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("../security.service");
const validation_service_1 = require("../validation.service");
let SecurityGuard = class SecurityGuard {
    constructor(securityService, validationService) {
        this.securityService = securityService;
        this.validationService = validationService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        this.checkSQLInjection(request);
        this.checkXSS(request);
        this.sanitizeRequest(request);
        this.checkSuspiciousActivity(request);
        return true;
    }
    checkSQLInjection(request) {
        const checkData = (data, path = '') => {
            if (typeof data === 'string') {
                if (this.validationService.detectSQLInjection(data)) {
                    this.securityService.logSecurityEvent('SQL_INJECTION_ATTEMPT', {
                        path,
                        data: data.substring(0, 100),
                        ip: request.ip,
                        userAgent: request.get('User-Agent')
                    });
                    throw new common_1.BadRequestException('Invalid input detected');
                }
            }
            else if (typeof data === 'object' && data !== null) {
                Object.keys(data).forEach(key => {
                    checkData(data[key], `${path}.${key}`);
                });
            }
        };
        checkData(request.query, 'query');
        checkData(request.body, 'body');
        checkData(request.params, 'params');
    }
    checkXSS(request) {
        const checkData = (data, path = '') => {
            if (typeof data === 'string') {
                if (this.validationService.detectXSS(data)) {
                    this.securityService.logSecurityEvent('XSS_ATTEMPT', {
                        path,
                        data: data.substring(0, 100),
                        ip: request.ip,
                        userAgent: request.get('User-Agent')
                    });
                    throw new common_1.BadRequestException('Invalid input detected');
                }
            }
            else if (typeof data === 'object' && data !== null) {
                Object.keys(data).forEach(key => {
                    checkData(data[key], `${path}.${key}`);
                });
            }
        };
        checkData(request.query, 'query');
        checkData(request.body, 'body');
    }
    sanitizeRequest(request) {
        const sanitizeData = (data) => {
            if (typeof data === 'string') {
                return this.validationService.sanitizeInput(data);
            }
            else if (Array.isArray(data)) {
                return data.map(item => sanitizeData(item));
            }
            else if (typeof data === 'object' && data !== null) {
                const sanitized = {};
                Object.keys(data).forEach(key => {
                    sanitized[key] = sanitizeData(data[key]);
                });
                return sanitized;
            }
            return data;
        };
        if (request.body) {
            request.body = sanitizeData(request.body);
        }
        if (request.query) {
            request.query = sanitizeData(request.query);
        }
    }
    checkSuspiciousActivity(request) {
        const suspiciousHeaders = [
            'x-forwarded-for',
            'x-real-ip',
            'x-cluster-client-ip'
        ];
        Object.keys(request.headers).forEach(header => {
            const value = request.headers[header];
            if (typeof value === 'string' && (value.includes('\n') || value.includes('\r'))) {
                this.securityService.logSecurityEvent('HEADER_INJECTION_ATTEMPT', {
                    header,
                    value: value.substring(0, 100),
                    ip: request.ip
                });
                throw new common_1.BadRequestException('Invalid header detected');
            }
        });
        const userAgent = request.get('User-Agent') || '';
        const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap'];
        if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
            this.securityService.logSecurityEvent('SUSPICIOUS_USER_AGENT', {
                userAgent,
                ip: request.ip
            });
            throw new common_1.ForbiddenException('Access denied');
        }
    }
};
exports.SecurityGuard = SecurityGuard;
exports.SecurityGuard = SecurityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_service_1.SecurityService,
        validation_service_1.ValidationService])
], SecurityGuard);
//# sourceMappingURL=security.guard.js.map