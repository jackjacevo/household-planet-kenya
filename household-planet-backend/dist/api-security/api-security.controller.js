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
exports.ApiSecurityController = void 0;
const common_1 = require("@nestjs/common");
const api_versioning_service_1 = require("./api-versioning.service");
const api_documentation_service_1 = require("./api-documentation.service");
const cors_config_service_1 = require("./cors-config.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let ApiSecurityController = class ApiSecurityController {
    constructor(apiVersioning, apiDocumentation, corsConfig) {
        this.apiVersioning = apiVersioning;
        this.apiDocumentation = apiDocumentation;
        this.corsConfig = corsConfig;
    }
    getVersionInfo() {
        return this.apiVersioning.getApiVersionInfo();
    }
    getSecurityDocumentation() {
        return {
            guidelines: this.apiDocumentation.getSecurityGuidelines(),
            endpoints: this.apiDocumentation.getApiEndpoints(),
            bestPractices: this.apiDocumentation.getSecurityBestPractices(),
        };
    }
    getCorsConfiguration() {
        return {
            corsOptions: this.corsConfig.getCorsOptions(),
            securityHeaders: this.corsConfig.getSecurityHeaders(),
        };
    }
    getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.API_VERSION || 'v2',
            environment: process.env.NODE_ENV || 'development',
            security: {
                httpsEnabled: process.env.NODE_ENV === 'production',
                rateLimitingEnabled: true,
                corsEnabled: true,
                authenticationRequired: true,
            },
        };
    }
};
exports.ApiSecurityController = ApiSecurityController;
__decorate([
    (0, common_1.Get)('version-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiSecurityController.prototype, "getVersionInfo", null);
__decorate([
    (0, common_1.Get)('documentation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiSecurityController.prototype, "getSecurityDocumentation", null);
__decorate([
    (0, common_1.Get)('cors-config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiSecurityController.prototype, "getCorsConfiguration", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiSecurityController.prototype, "getHealthStatus", null);
exports.ApiSecurityController = ApiSecurityController = __decorate([
    (0, common_1.Controller)('api-security'),
    __metadata("design:paramtypes", [api_versioning_service_1.ApiVersioningService,
        api_documentation_service_1.ApiDocumentationService,
        cors_config_service_1.CorsConfigService])
], ApiSecurityController);
//# sourceMappingURL=api-security.controller.js.map