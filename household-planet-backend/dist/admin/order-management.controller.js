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
exports.OrderManagementController = void 0;
const common_1 = require("@nestjs/common");
const order_management_service_1 = require("./order-management.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let OrderManagementController = class OrderManagementController {
    constructor(orderManagementService) {
        this.orderManagementService = orderManagementService;
    }
    async getOrders(filters) {
        return this.orderManagementService.getOrders(filters);
    }
    async getOrderStats() {
        return this.orderManagementService.getOrderStats();
    }
    async getOrder(id) {
        return this.orderManagementService.getOrderById(id);
    }
    async updateOrderStatus(id, data) {
        return this.orderManagementService.updateOrderStatus(id, data.status, data.notes);
    }
    async bulkUpdateOrders(data) {
        return this.orderManagementService.bulkUpdateOrders(data.orderIds, data.updates);
    }
    async verifyPayment(id) {
        return this.orderManagementService.verifyPayment(id);
    }
    async generateShippingLabel(id) {
        return this.orderManagementService.generateShippingLabel(id);
    }
    async updateDeliveryStatus(id, data) {
        return this.orderManagementService.updateDeliveryStatus(id, data.status, data.location, data.notes);
    }
    async addOrderNote(id, data) {
        return this.orderManagementService.addOrderNote(id, data.notes);
    }
    async processReturn(id, data) {
        return this.orderManagementService.processReturn(id, data.status, data.notes);
    }
    async sendCustomerEmail(id, data) {
        return this.orderManagementService.sendCustomerEmail(id, data.template, data.customMessage);
    }
};
exports.OrderManagementController = OrderManagementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "getOrderStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Put)('bulk/update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "bulkUpdateOrders", null);
__decorate([
    (0, common_1.Post)(':id/verify-payment'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)(':id/shipping-label'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "generateShippingLabel", null);
__decorate([
    (0, common_1.Put)(':id/delivery'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "updateDeliveryStatus", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "addOrderNote", null);
__decorate([
    (0, common_1.Put)('returns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "processReturn", null);
__decorate([
    (0, common_1.Post)(':id/email'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderManagementController.prototype, "sendCustomerEmail", null);
exports.OrderManagementController = OrderManagementController = __decorate([
    (0, common_1.Controller)('api/admin/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [order_management_service_1.OrderManagementService])
], OrderManagementController);
//# sourceMappingURL=order-management.controller.js.map