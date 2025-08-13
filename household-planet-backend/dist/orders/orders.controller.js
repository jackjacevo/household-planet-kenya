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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const create_order_with_payment_dto_1 = require("./dto/create-order-with-payment.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const return_request_dto_1 = require("./dto/return-request.dto");
const guest_checkout_dto_1 = require("./dto/guest-checkout.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const enums_1 = require("../common/enums");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    createOrder(userId, createOrderDto) {
        return this.ordersService.createOrder(userId, createOrderDto);
    }
    createOrderWithPayment(userId, createOrderDto) {
        return this.ordersService.createOrderWithMpesaPayment(userId, createOrderDto);
    }
    createOrderFromCart(userId, orderData) {
        return this.ordersService.createOrderFromCart(userId, orderData);
    }
    getOrders(userId, page, limit) {
        return this.ordersService.getOrders(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    getOrderById(userId, orderId) {
        return this.ordersService.getOrderById(userId, orderId);
    }
    getOrderTracking(userId, orderId) {
        return this.ordersService.getOrderTracking(userId, orderId);
    }
    updateOrderStatus(orderId, updateStatusDto) {
        return this.ordersService.updateOrderStatus(orderId, updateStatusDto);
    }
    createReturnRequest(userId, orderId, returnRequestDto) {
        return this.ordersService.createReturnRequest(userId, orderId, returnRequestDto);
    }
    getReturnRequests(userId) {
        return this.ordersService.getReturnRequests(userId);
    }
    updateReturnRequestStatus(returnRequestId, body) {
        return this.ordersService.updateReturnRequestStatus(returnRequestId, body.status, body.notes);
    }
    createGuestOrder(guestCheckoutDto) {
        return this.ordersService.createGuestOrder(guestCheckoutDto);
    }
    getGuestOrder(orderNumber, email) {
        return this.ordersService.getGuestOrderByNumber(orderNumber, email);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('with-payment'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_with_payment_dto_1.CreateOrderWithPaymentDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrderWithPayment", null);
__decorate([
    (0, common_1.Post)('from-cart'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrderFromCart", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Get)(':orderId/tracking'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrderTracking", null);
__decorate([
    (0, common_1.Put)(':orderId/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Post)(':orderId/return'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, return_request_dto_1.ReturnRequestDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createReturnRequest", null);
__decorate([
    (0, common_1.Get)('returns/my-requests'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getReturnRequests", null);
__decorate([
    (0, common_1.Put)('returns/:returnRequestId/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('returnRequestId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateReturnRequestStatus", null);
__decorate([
    (0, common_1.Post)('guest-checkout'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_checkout_dto_1.GuestCheckoutDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createGuestOrder", null);
__decorate([
    (0, common_1.Get)('guest/:orderNumber'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('orderNumber')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getGuestOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map