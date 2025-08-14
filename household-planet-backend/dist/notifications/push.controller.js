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
exports.PushController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const push_service_1 = require("./push.service");
let PushController = class PushController {
    constructor(pushService) {
        this.pushService = pushService;
    }
    async subscribe(user, subscription) {
        return this.pushService.subscribe(user.id, subscription);
    }
    async unsubscribe(body) {
        return this.pushService.unsubscribe(body.endpoint);
    }
    async testNotification(user) {
        return this.pushService.sendNotification(user.id, {
            title: '🧪 Test Notification',
            body: 'This is a test notification from Household Planet Kenya',
            url: '/',
            tag: 'test'
        });
    }
    async broadcastNotification(user, payload) {
        if (user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }
        return this.pushService.broadcastNotification(payload);
    }
    async sendOrderUpdate(user, body) {
        if (user.role !== 'ADMIN' && user.id !== body.userId) {
            return { success: false, error: 'Unauthorized' };
        }
        return this.pushService.sendOrderUpdate(body.userId, body.orderId, body.status);
    }
    async sendAbandonedCartReminder(user, body) {
        if (user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }
        return this.pushService.sendAbandonedCartReminder(body.userId, body.cartItems);
    }
    async sendPromotion(user, body) {
        if (user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }
        if (body.userId) {
            return this.pushService.sendPromotion(body.userId, body.title, body.message, body.url);
        }
        else {
            return this.pushService.broadcastNotification({
                title: body.title,
                body: body.message,
                url: body.url
            });
        }
    }
    getVapidKey() {
        return this.pushService.getVapidPublicKey();
    }
};
exports.PushController = PushController;
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('unsubscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "unsubscribe", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "testNotification", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "broadcastNotification", null);
__decorate([
    (0, common_1.Post)('order-update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "sendOrderUpdate", null);
__decorate([
    (0, common_1.Post)('abandoned-cart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "sendAbandonedCartReminder", null);
__decorate([
    (0, common_1.Post)('promotion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PushController.prototype, "sendPromotion", null);
__decorate([
    (0, common_1.Get)('vapid-key'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PushController.prototype, "getVapidKey", null);
exports.PushController = PushController = __decorate([
    (0, common_1.Controller)('push'),
    __metadata("design:paramtypes", [push_service_1.PushService])
], PushController);
//# sourceMappingURL=push.controller.js.map