"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const security_service_1 = require("./security.service");
const encryption_service_1 = require("./encryption.service");
const validation_service_1 = require("./validation.service");
const csrf_service_1 = require("./csrf.service");
const csrf_protection_service_1 = require("./csrf-protection.service");
const csrf_guard_1 = require("./guards/csrf.guard");
const simple_monitoring_service_1 = require("./simple-monitoring.service");
const security_controller_1 = require("./security.controller");
const csrf_controller_1 = require("./csrf.controller");
const secure_logger_service_1 = require("./secure-logger.service");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const input_sanitizer_service_1 = require("./input-sanitizer.service");
const prisma_module_1 = require("../prisma/prisma.module");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100
                }
            ]),
        ],
        controllers: [security_controller_1.SecurityController, csrf_controller_1.CsrfController],
        providers: [
            security_service_1.SecurityService,
            encryption_service_1.EncryptionService,
            validation_service_1.ValidationService,
            csrf_service_1.CsrfService,
            csrf_protection_service_1.CsrfProtectionService,
            csrf_guard_1.CsrfGuard,
            simple_monitoring_service_1.SimpleMonitoringService,
            secure_logger_service_1.SecureLoggerService,
            log_sanitizer_service_1.LogSanitizerService,
            input_sanitizer_service_1.InputSanitizerService,
            { provide: 'SentryMonitoringService', useClass: simple_monitoring_service_1.SimpleMonitoringService },
            { provide: 'VulnerabilityScanner', useValue: { scanDependencies: () => ({ status: 'ok' }), scanCodePatterns: () => ({ status: 'ok' }), scanConfiguration: () => ({ status: 'ok' }) } },
            { provide: 'IncidentResponseService', useValue: { reportSecurityIncident: () => ({ status: 'reported' }), getIncidentResponsePlan: () => ({ plan: 'basic' }), getSecurityAuditLog: () => ([]), generateSecurityReport: () => ({ report: 'basic' }) } },
            { provide: 'SecurityTrainingService', useValue: { getTrainingModules: () => ([]), recordTrainingCompletion: () => ({ status: 'completed' }), getTrainingStatus: () => ({ status: 'not_started' }), generateTrainingReport: () => ({ report: 'basic' }) } },
        ],
        exports: [
            security_service_1.SecurityService,
            encryption_service_1.EncryptionService,
            validation_service_1.ValidationService,
            csrf_service_1.CsrfService,
            csrf_protection_service_1.CsrfProtectionService,
            csrf_guard_1.CsrfGuard,
            simple_monitoring_service_1.SimpleMonitoringService,
            secure_logger_service_1.SecureLoggerService,
            log_sanitizer_service_1.LogSanitizerService,
            input_sanitizer_service_1.InputSanitizerService,
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map