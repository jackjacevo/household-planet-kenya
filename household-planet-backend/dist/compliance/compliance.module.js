"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceModule = void 0;
const common_1 = require("@nestjs/common");
const compliance_controller_1 = require("./compliance.controller");
const compliance_service_1 = require("./compliance.service");
const cookie_consent_service_1 = require("./cookie-consent.service");
const data_export_service_1 = require("./data-export.service");
const data_retention_service_1 = require("./data-retention.service");
const age_verification_service_1 = require("./age-verification.service");
const geographic_restrictions_service_1 = require("./geographic-restrictions.service");
const tax_compliance_service_1 = require("./tax-compliance.service");
const consumer_rights_service_1 = require("./consumer-rights.service");
const dispute_resolution_service_1 = require("./dispute-resolution.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ComplianceModule = class ComplianceModule {
};
exports.ComplianceModule = ComplianceModule;
exports.ComplianceModule = ComplianceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [compliance_controller_1.ComplianceController],
        providers: [
            compliance_service_1.ComplianceService,
            cookie_consent_service_1.CookieConsentService,
            data_export_service_1.DataExportService,
            data_retention_service_1.DataRetentionService,
            age_verification_service_1.AgeVerificationService,
            geographic_restrictions_service_1.GeographicRestrictionsService,
            tax_compliance_service_1.TaxComplianceService,
            consumer_rights_service_1.ConsumerRightsService,
            dispute_resolution_service_1.DisputeResolutionService,
        ],
        exports: [
            compliance_service_1.ComplianceService,
            age_verification_service_1.AgeVerificationService,
            geographic_restrictions_service_1.GeographicRestrictionsService,
            tax_compliance_service_1.TaxComplianceService,
            consumer_rights_service_1.ConsumerRightsService,
            dispute_resolution_service_1.DisputeResolutionService,
        ],
    })
], ComplianceModule);
//# sourceMappingURL=compliance.module.js.map