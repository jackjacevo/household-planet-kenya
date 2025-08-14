"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSecurityModule = void 0;
const common_1 = require("@nestjs/common");
const api_logging_service_1 = require("./api-logging.service");
const api_versioning_service_1 = require("./api-versioning.service");
const cors_config_service_1 = require("./cors-config.service");
const api_documentation_service_1 = require("./api-documentation.service");
const api_security_controller_1 = require("./api-security.controller");
let ApiSecurityModule = class ApiSecurityModule {
};
exports.ApiSecurityModule = ApiSecurityModule;
exports.ApiSecurityModule = ApiSecurityModule = __decorate([
    (0, common_1.Module)({
        controllers: [api_security_controller_1.ApiSecurityController],
        providers: [
            api_logging_service_1.ApiLoggingService,
            api_versioning_service_1.ApiVersioningService,
            cors_config_service_1.CorsConfigService,
            api_documentation_service_1.ApiDocumentationService,
        ],
        exports: [
            api_logging_service_1.ApiLoggingService,
            api_versioning_service_1.ApiVersioningService,
            cors_config_service_1.CorsConfigService,
            api_documentation_service_1.ApiDocumentationService,
        ],
    })
], ApiSecurityModule);
//# sourceMappingURL=api-security.module.js.map