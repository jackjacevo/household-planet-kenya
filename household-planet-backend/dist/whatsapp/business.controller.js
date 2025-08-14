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
exports.WhatsAppBusinessController = void 0;
const common_1 = require("@nestjs/common");
const business_service_1 = require("./business.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let WhatsAppBusinessController = class WhatsAppBusinessController {
    constructor(businessService) {
        this.businessService = businessService;
    }
    async setBusinessHours(hours) {
        await this.businessService.setBusinessHours(hours);
        return { success: true };
    }
    async getBusinessHours() {
        return this.businessService.getBusinessHours();
    }
    async getBusinessStatus() {
        const isOpen = await this.businessService.isBusinessOpen();
        return { isOpen };
    }
    async setAutoReply(body) {
        await this.businessService.setAutoReply(body.type, body.message);
        return { success: true };
    }
    async getAutoReply(type) {
        return this.businessService.getAutoReply(type);
    }
    async createSegment(body) {
        return this.businessService.createCustomerSegment(body.name, body.criteria);
    }
    async getSegmentCustomers(segmentId) {
        return this.businessService.getCustomersInSegment(segmentId);
    }
    async createCampaign(body) {
        const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
        return this.businessService.createBroadcastCampaign({
            name: body.name,
            message: body.message,
            segmentId: body.segmentId,
            phoneNumbers: body.phoneNumbers,
            scheduledAt,
            mediaUrl: body.mediaUrl,
        });
    }
    async executeCampaign(campaignId) {
        return this.businessService.executeCampaign(campaignId);
    }
    async getCampaignAnalytics(campaignId) {
        return this.businessService.getCampaignAnalytics(campaignId);
    }
    async addContact(body) {
        return this.businessService.addContact(body.phoneNumber, body.name, body.userId);
    }
    async optOutContact(phoneNumber) {
        await this.businessService.optOutContact(phoneNumber);
        return { success: true };
    }
    async optInContact(phoneNumber) {
        await this.businessService.optInContact(phoneNumber);
        return { success: true };
    }
    async getContacts() {
        return this.businessService.getOptedInContacts();
    }
    async getBusinessAnalytics(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.businessService.getBusinessAnalytics(start, end);
    }
    async sendWelcomeMessage(body) {
        const success = await this.businessService.sendWelcomeMessage(body.phoneNumber, body.customerName);
        return { success };
    }
    async sendOrderUpdate(body) {
        const success = await this.businessService.sendOrderStatusUpdate(body.orderId, body.status, body.customMessage);
        return { success };
    }
    async sendBulkWelcomeMessages(body) {
        const results = await Promise.all(body.contacts.map(contact => this.businessService.sendWelcomeMessage(contact.phoneNumber, contact.name)));
        const successful = results.filter(r => r).length;
        return {
            total: body.contacts.length,
            successful,
            failed: body.contacts.length - successful,
        };
    }
    async bulkOptOut(body) {
        const results = await Promise.all(body.phoneNumbers.map(phoneNumber => this.businessService.optOutContact(phoneNumber).catch(() => false)));
        const successful = results.filter(r => r).length;
        return {
            total: body.phoneNumbers.length,
            successful,
            failed: body.phoneNumbers.length - successful,
        };
    }
    async sendTemplateMessage(body) {
        return {
            message: 'Template messages queued for sending',
            recipients: body.phoneNumbers.length,
        };
    }
    async getPerformanceMetrics(days = '30') {
        const daysNum = parseInt(days);
        const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
        const endDate = new Date();
        const analytics = await this.businessService.getBusinessAnalytics(startDate, endDate);
        return {
            period: `${daysNum} days`,
            ...analytics,
            trends: {
                messageGrowth: 0,
                contactGrowth: 0,
                engagementRate: 0,
            },
        };
    }
    async exportContacts() {
        const contacts = await this.businessService.getOptedInContacts();
        return {
            data: contacts,
            exportedAt: new Date(),
            totalContacts: contacts.length,
        };
    }
    async exportAnalytics(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const analytics = await this.businessService.getBusinessAnalytics(start, end);
        return {
            period: { start, end },
            data: analytics,
            exportedAt: new Date(),
        };
    }
};
exports.WhatsAppBusinessController = WhatsAppBusinessController;
__decorate([
    (0, common_1.Post)('hours'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "setBusinessHours", null);
__decorate([
    (0, common_1.Get)('hours'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getBusinessHours", null);
__decorate([
    (0, common_1.Get)('hours/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getBusinessStatus", null);
__decorate([
    (0, common_1.Post)('auto-reply'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "setAutoReply", null);
__decorate([
    (0, common_1.Get)('auto-reply/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getAutoReply", null);
__decorate([
    (0, common_1.Post)('segments'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "createSegment", null);
__decorate([
    (0, common_1.Get)('segments/:id/customers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getSegmentCustomers", null);
__decorate([
    (0, common_1.Post)('campaigns'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Post)('campaigns/:id/execute'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "executeCampaign", null);
__decorate([
    (0, common_1.Get)('campaigns/:id/analytics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getCampaignAnalytics", null);
__decorate([
    (0, common_1.Post)('contacts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "addContact", null);
__decorate([
    (0, common_1.Put)('contacts/:phoneNumber/opt-out'),
    __param(0, (0, common_1.Param)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "optOutContact", null);
__decorate([
    (0, common_1.Put)('contacts/:phoneNumber/opt-in'),
    __param(0, (0, common_1.Param)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "optInContact", null);
__decorate([
    (0, common_1.Get)('contacts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getBusinessAnalytics", null);
__decorate([
    (0, common_1.Post)('quick-actions/welcome'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "sendWelcomeMessage", null);
__decorate([
    (0, common_1.Post)('quick-actions/order-update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "sendOrderUpdate", null);
__decorate([
    (0, common_1.Post)('bulk/welcome-messages'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "sendBulkWelcomeMessages", null);
__decorate([
    (0, common_1.Post)('bulk/opt-out'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "bulkOptOut", null);
__decorate([
    (0, common_1.Post)('templates/quick-send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "sendTemplateMessage", null);
__decorate([
    (0, common_1.Get)('metrics/performance'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('export/contacts'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "exportContacts", null);
__decorate([
    (0, common_1.Get)('export/analytics'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppBusinessController.prototype, "exportAnalytics", null);
exports.WhatsAppBusinessController = WhatsAppBusinessController = __decorate([
    (0, common_1.Controller)('whatsapp/business'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __metadata("design:paramtypes", [business_service_1.WhatsAppBusinessService])
], WhatsAppBusinessController);
//# sourceMappingURL=business.controller.js.map