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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const csrf_service_1 = require("./csrf.service");
const security_service_1 = require("./security.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let SecurityController = class SecurityController {
    constructor(csrfService, securityService, sentryService, vulnerabilityScanner, incidentResponseService, securityTrainingService) {
        this.csrfService = csrfService;
        this.securityService = securityService;
        this.sentryService = sentryService;
        this.vulnerabilityScanner = vulnerabilityScanner;
        this.incidentResponseService = incidentResponseService;
        this.securityTrainingService = securityTrainingService;
    }
    getCsrfToken(req, res) {
        const sessionId = req.session?.id || req.get('X-Session-ID') || 'anonymous';
        const token = this.csrfService.generateToken(sessionId);
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        res.json({ csrfToken: token });
    }
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            security: {
                https: process.env.NODE_ENV === 'production',
                headers: 'enabled',
                rateLimit: 'enabled',
                validation: 'enabled'
            }
        };
    }
    reportSecurityViolation(req) {
        const violation = req.body;
        this.securityService.logSecurityEvent('CSP_VIOLATION', {
            violation,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        return { status: 'reported' };
    }
    async reportSecurityIncident(incidentData, req) {
        return this.incidentResponseService.reportSecurityIncident({
            ...incidentData,
            reportedBy: req.user.id,
        });
    }
    getIncidentResponsePlan() {
        return this.incidentResponseService.getIncidentResponsePlan();
    }
    async getSecurityAuditLog(startDate, endDate) {
        return this.incidentResponseService.getSecurityAuditLog(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async generateSecurityReport(period) {
        return this.incidentResponseService.generateSecurityReport(period);
    }
    async scanDependencies() {
        return this.vulnerabilityScanner.scanDependencies();
    }
    async scanCodePatterns() {
        return this.vulnerabilityScanner.scanCodePatterns();
    }
    async scanConfiguration() {
        return this.vulnerabilityScanner.scanConfiguration();
    }
    async getTrainingModules() {
        return this.securityTrainingService.getTrainingModules();
    }
    async completeTraining(moduleId, body, req) {
        return this.securityTrainingService.recordTrainingCompletion(req.user.id, moduleId, body.score);
    }
    async getTrainingStatus(req) {
        return this.securityTrainingService.getTrainingStatus(req.user.id);
    }
    async generateTrainingReport(startDate, endDate) {
        return this.securityTrainingService.generateTrainingReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('csrf-token'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getCsrfToken", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('report-violation'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "reportSecurityViolation", null);
__decorate([
    (0, common_1.Post)('incident'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "reportSecurityIncident", null);
__decorate([
    (0, common_1.Get)('incident-response-plan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getIncidentResponsePlan", null);
__decorate([
    (0, common_1.Get)('audit-log'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getSecurityAuditLog", null);
__decorate([
    (0, common_1.Get)('security-report/:period'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "generateSecurityReport", null);
__decorate([
    (0, common_1.Post)('scan/dependencies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "scanDependencies", null);
__decorate([
    (0, common_1.Post)('scan/code-patterns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "scanCodePatterns", null);
__decorate([
    (0, common_1.Post)('scan/configuration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "scanConfiguration", null);
__decorate([
    (0, common_1.Get)('training/modules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getTrainingModules", null);
__decorate([
    (0, common_1.Post)('training/:moduleId/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "completeTraining", null);
__decorate([
    (0, common_1.Get)('training/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getTrainingStatus", null);
__decorate([
    (0, common_1.Get)('training/report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "generateTrainingReport", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('security'),
    __param(2, (0, common_1.Inject)('SentryMonitoringService')),
    __param(3, (0, common_1.Inject)('VulnerabilityScanner')),
    __param(4, (0, common_1.Inject)('IncidentResponseService')),
    __param(5, (0, common_1.Inject)('SecurityTrainingService')),
    __metadata("design:paramtypes", [csrf_service_1.CsrfService,
        security_service_1.SecurityService, Object, Object, Object, Object])
], SecurityController);
//# sourceMappingURL=security.controller.js.map