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
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const abandoned_cart_service_1 = require("./abandoned-cart.service");
const template_service_1 = require("./template.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let WhatsAppController = class WhatsAppController {
    constructor(whatsappService, abandonedCartService, templateService) {
        this.whatsappService = whatsappService;
        this.abandonedCartService = abandonedCartService;
        this.templateService = templateService;
    }
    getStatus() {
        return {
            isReady: this.whatsappService.isClientReady(),
            qrCode: this.whatsappService.getQRCode(),
        };
    }
    async getStats() {
        const [messageStats, cartStats] = await Promise.all([
            this.whatsappService.getMessageStats(),
            this.abandonedCartService.getAbandonedCartStats(),
        ]);
        return {
            messages: messageStats,
            abandonedCarts: cartStats,
        };
    }
    async getMessages(phoneNumber, userId, limit) {
        return this.whatsappService.getMessageHistory(phoneNumber, userId, limit ? parseInt(limit) : 50);
    }
    async sendMessage(body) {
        const success = await this.whatsappService.sendMessage(body.phoneNumber, body.message, body.type || 'MANUAL', null, body.userId, body.mediaUrl);
        return { success };
    }
    async sendPromotional(body) {
        const results = await Promise.all(body.phoneNumbers.map(phoneNumber => this.whatsappService.sendPromotionalMessage(phoneNumber, body.title, body.description, body.link)));
        const successful = results.filter(r => r).length;
        return {
            total: body.phoneNumbers.length,
            successful,
            failed: body.phoneNumbers.length - successful,
        };
    }
    async trackAbandonedCart(body) {
        await this.abandonedCartService.trackAbandonedCart(body.userId, body.sessionId, body.phoneNumber, body.cartItems);
        return { success: true };
    }
    async markCartRecovered(body) {
        await this.abandonedCartService.markCartAsRecovered(body.userId, body.sessionId, body.phoneNumber);
        return { success: true };
    }
    async getTemplates() {
        return this.templateService.getAllTemplates();
    }
    async getTemplate(name) {
        return this.templateService.getTemplate(name);
    }
    async createTemplate(body) {
        return this.templateService.createTemplate(body.name, body.type, body.template);
    }
    async updateTemplate(name, body) {
        return this.templateService.updateTemplate(name, body.template);
    }
    async seedTemplates() {
        await this.templateService.seedDefaultTemplates();
        return { success: true };
    }
    getContactInfo() {
        return {
            whatsappNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '+254700000000',
            message: 'Hello! I\'m interested in your products.',
            link: `https://wa.me/${process.env.WHATSAPP_BUSINESS_NUMBER?.replace('+', '') || '254700000000'}?text=Hello!%20I'm%20interested%20in%20your%20products.`,
        };
    }
    async sendQuickInquiry(body) {
        const businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '+254700000000';
        let inquiryMessage = `New product inquiry from ${body.phoneNumber}:\n\n`;
        if (body.productName) {
            inquiryMessage += `Product: ${body.productName}\n`;
        }
        if (body.productUrl) {
            inquiryMessage += `URL: ${body.productUrl}\n`;
        }
        if (body.message) {
            inquiryMessage += `Message: ${body.message}\n`;
        }
        const success = await this.whatsappService.sendMessage(businessNumber.replace('+', ''), inquiryMessage, 'INQUIRY');
        return { success };
    }
};
exports.WhatsAppController = WhatsAppController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __param(0, (0, common_1.Query)('phoneNumber')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('send-promotional'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendPromotional", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('abandoned-cart/track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "trackAbandonedCart", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('abandoned-cart/recovered'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "markCartRecovered", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:name'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:name'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Post)('templates/seed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "seedTemplates", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('contact-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "getContactInfo", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('quick-inquiry'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendQuickInquiry", null);
exports.WhatsAppController = WhatsAppController = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService,
        abandoned_cart_service_1.AbandonedCartService,
        template_service_1.WhatsAppTemplateService])
], WhatsAppController);
//# sourceMappingURL=whatsapp.controller.js.map