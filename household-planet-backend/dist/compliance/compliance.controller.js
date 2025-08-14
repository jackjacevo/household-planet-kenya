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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const compliance_service_1 = require("./compliance.service");
const cookie_consent_service_1 = require("./cookie-consent.service");
const data_export_service_1 = require("./data-export.service");
const data_retention_service_1 = require("./data-retention.service");
const age_verification_service_1 = require("./age-verification.service");
const geographic_restrictions_service_1 = require("./geographic-restrictions.service");
const tax_compliance_service_1 = require("./tax-compliance.service");
const consumer_rights_service_1 = require("./consumer-rights.service");
const dispute_resolution_service_1 = require("./dispute-resolution.service");
let ComplianceController = class ComplianceController {
    constructor(complianceService, cookieConsentService, dataExportService, dataRetentionService, ageVerificationService, geographicRestrictionsService, taxComplianceService, consumerRightsService, disputeResolutionService) {
        this.complianceService = complianceService;
        this.cookieConsentService = cookieConsentService;
        this.dataExportService = dataExportService;
        this.dataRetentionService = dataRetentionService;
        this.ageVerificationService = ageVerificationService;
        this.geographicRestrictionsService = geographicRestrictionsService;
        this.taxComplianceService = taxComplianceService;
        this.consumerRightsService = consumerRightsService;
        this.disputeResolutionService = disputeResolutionService;
    }
    async recordCookieConsent(body, req) {
        return this.cookieConsentService.recordCookieConsent(req.sessionID, body.consents, req.ip);
    }
    async getCookieConsent(sessionId) {
        return this.cookieConsentService.getCookieConsent(sessionId);
    }
    getCookiePolicy() {
        return this.cookieConsentService.getCookiePolicy();
    }
    async recordConsent(body, req) {
        return this.complianceService.recordConsent(req.user.id, body.consentType, body.granted);
    }
    async getUserConsents(req) {
        return this.complianceService.getUserConsents(req.user.id);
    }
    async updatePrivacySettings(settings, req) {
        return this.complianceService.updatePrivacySettings(req.user.id, settings);
    }
    async requestDataExport(req) {
        return this.dataExportService.exportUserData(req.user.id);
    }
    async getExportHistory(req) {
        return this.dataExportService.getExportHistory(req.user.id);
    }
    async requestAccountDeletion(body, req) {
        return this.complianceService.requestDataDeletion(req.user.id, body.reason);
    }
    getPrivacyPolicy() {
        return {
            lastUpdated: '2025-01-01',
            sections: {
                dataCollection: 'We collect personal information you provide when creating an account, making purchases, or contacting us.',
                dataUsage: 'Your data is used to process orders, provide customer service, and improve our services.',
                dataSharing: 'We do not sell your personal data. We may share data with service providers who help us operate our business.',
                dataRetention: 'We retain your data as long as your account is active or as needed to provide services.',
                yourRights: 'You have the right to access, update, or delete your personal data.',
                contact: 'Contact us at privacy@householdplanet.co.ke for privacy-related questions.',
            },
        };
    }
    getRetentionPolicy() {
        return this.dataRetentionService.getRetentionPolicy();
    }
    async verifyAge(body, req) {
        return this.ageVerificationService.verifyAge(req.user.id, new Date(body.dateOfBirth), body.documentType, body.documentNumber);
    }
    async checkProductAgeRestriction(productId, req) {
        const userId = req.user?.id;
        return this.ageVerificationService.checkProductAgeRestriction(parseInt(productId), userId);
    }
    async checkGeographicRestriction(productId, county, subcounty) {
        return this.geographicRestrictionsService.checkGeographicRestriction(parseInt(productId), county, subcounty);
    }
    async getAvailableRegions(productId) {
        return this.geographicRestrictionsService.getAvailableRegions(parseInt(productId));
    }
    async calculateVAT(productId, amount) {
        return this.taxComplianceService.calculateVAT(productId, parseFloat(amount));
    }
    getBusinessRegistrationInfo() {
        return this.taxComplianceService.getBusinessRegistrationInfo();
    }
    async generateVATReport(startDate, endDate) {
        return this.taxComplianceService.generateVATReport(new Date(startDate), new Date(endDate));
    }
    getConsumerRights() {
        return this.consumerRightsService.getConsumerRights();
    }
    async getReturnPolicy() {
        return this.consumerRightsService.getReturnPolicy();
    }
    async getWarrantyInfo(productId) {
        return this.consumerRightsService.getWarrantyInfo(parseInt(productId));
    }
    async recordConsumerComplaint(complaintData, req) {
        return this.consumerRightsService.recordConsumerComplaint(req.user.id, complaintData);
    }
    async initiateDispute(disputeData, req) {
        return this.disputeResolutionService.initiateDispute(req.user.id, disputeData);
    }
    getDisputeResolutionProcess() {
        return this.disputeResolutionService.getDisputeResolutionProcess();
    }
    async getDisputeHistory(req) {
        return this.disputeResolutionService.getDisputeHistory(req.user.id);
    }
    async escalateDispute(disputeId, body) {
        return this.disputeResolutionService.escalateDispute(parseInt(disputeId), body.reason);
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Post)('cookie-consent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "recordCookieConsent", null);
__decorate([
    (0, common_1.Get)('cookie-consent/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getCookieConsent", null);
__decorate([
    (0, common_1.Get)('cookie-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getCookiePolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('consent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('consents'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getUserConsents", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('privacy-settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "updatePrivacySettings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('data-export'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "requestDataExport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('export-history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getExportHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('account'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "requestAccountDeletion", null);
__decorate([
    (0, common_1.Get)('privacy-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getPrivacyPolicy", null);
__decorate([
    (0, common_1.Get)('retention-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getRetentionPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('age-verification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "verifyAge", null);
__decorate([
    (0, common_1.Get)('product/:productId/age-restriction'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "checkProductAgeRestriction", null);
__decorate([
    (0, common_1.Get)('product/:productId/geographic-availability'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('county')),
    __param(2, (0, common_1.Query)('subcounty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "checkGeographicRestriction", null);
__decorate([
    (0, common_1.Get)('product/:productId/available-regions'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getAvailableRegions", null);
__decorate([
    (0, common_1.Get)('vat-calculation/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "calculateVAT", null);
__decorate([
    (0, common_1.Get)('business-registration'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getBusinessRegistrationInfo", null);
__decorate([
    (0, common_1.Get)('vat-report'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateVATReport", null);
__decorate([
    (0, common_1.Get)('consumer-rights'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getConsumerRights", null);
__decorate([
    (0, common_1.Get)('return-policy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getReturnPolicy", null);
__decorate([
    (0, common_1.Get)('warranty/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getWarrantyInfo", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('complaint'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "recordConsumerComplaint", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('dispute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "initiateDispute", null);
__decorate([
    (0, common_1.Get)('dispute-process'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getDisputeResolutionProcess", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('disputes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getDisputeHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('dispute/:disputeId/escalate'),
    __param(0, (0, common_1.Param)('disputeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "escalateDispute", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, common_1.Controller)('compliance'),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService,
        cookie_consent_service_1.CookieConsentService,
        data_export_service_1.DataExportService,
        data_retention_service_1.DataRetentionService,
        age_verification_service_1.AgeVerificationService,
        geographic_restrictions_service_1.GeographicRestrictionsService,
        tax_compliance_service_1.TaxComplianceService,
        consumer_rights_service_1.ConsumerRightsService,
        dispute_resolution_service_1.DisputeResolutionService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map