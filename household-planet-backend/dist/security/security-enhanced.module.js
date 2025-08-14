"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityEnhancedModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const input_sanitizer_service_1 = require("./input-sanitizer.service");
const csrf_protection_service_1 = require("./csrf-protection.service");
const secure_logger_service_1 = require("./secure-logger.service");
const csrf_guard_1 = require("./guards/csrf.guard");
const input_sanitization_interceptor_1 = require("./interceptors/input-sanitization.interceptor");
const security_headers_interceptor_1 = require("./interceptors/security-headers.interceptor");
let SecurityEnhancedModule = class SecurityEnhancedModule {
};
exports.SecurityEnhancedModule = SecurityEnhancedModule;
exports.SecurityEnhancedModule = SecurityEnhancedModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            input_sanitizer_service_1.InputSanitizerService,
            csrf_protection_service_1.CsrfProtectionService,
            secure_logger_service_1.SecureLoggerService,
            {
                provide: core_1.APP_GUARD,
                useClass: csrf_guard_1.CsrfGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: input_sanitization_interceptor_1.InputSanitizationInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: security_headers_interceptor_1.SecurityHeadersInterceptor,
            },
        ],
        exports: [
            input_sanitizer_service_1.InputSanitizerService,
            csrf_protection_service_1.CsrfProtectionService,
            secure_logger_service_1.SecureLoggerService,
        ],
    })
], SecurityEnhancedModule);
//# sourceMappingURL=security-enhanced.module.js.map