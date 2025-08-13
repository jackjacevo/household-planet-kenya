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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const mpesa_service_1 = require("./mpesa.service");
const stripe_service_1 = require("./stripe.service");
const flutterwave_service_1 = require("./flutterwave.service");
const payment_management_service_1 = require("./payment-management.service");
const payment_retry_service_1 = require("./payment-retry.service");
const partial_payment_service_1 = require("./partial-payment.service");
const payment_analytics_service_1 = require("./payment-analytics.service");
const invoice_service_1 = require("./invoice.service");
const notification_service_1 = require("./notification.service");
const payment_security_service_1 = require("./payment-security.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
let PaymentsController = class PaymentsController {
    constructor(mpesaService, stripeService, flutterwaveService, paymentManagementService, paymentRetryService, partialPaymentService, paymentAnalyticsService, invoiceService, notificationService, paymentSecurityService) {
        this.mpesaService = mpesaService;
        this.stripeService = stripeService;
        this.flutterwaveService = flutterwaveService;
        this.paymentManagementService = paymentManagementService;
        this.paymentRetryService = paymentRetryService;
        this.partialPaymentService = partialPaymentService;
        this.paymentAnalyticsService = paymentAnalyticsService;
        this.invoiceService = invoiceService;
        this.notificationService = notificationService;
        this.paymentSecurityService = paymentSecurityService;
    }
    async initiatePayment(body, user) {
        return this.mpesaService.initiateSTKPush(body.phoneNumber, body.amount, body.orderId);
    }
    async mpesaCallback(callbackData) {
        await this.mpesaService.handleCallback(callbackData);
        return { ResultCode: 0, ResultDesc: 'Success' };
    }
    async getPaymentStatus(checkoutRequestId) {
        return this.mpesaService.checkPaymentStatus(checkoutRequestId);
    }
    async createStripePayment(body) {
        return this.stripeService.createPaymentIntent(body.amount, body.orderId);
    }
    async confirmStripePayment(body) {
        return this.stripeService.confirmPayment(body.paymentIntentId);
    }
    async initiateFlutterwavePayment(body) {
        return this.flutterwaveService.initiatePayment(body.amount, body.email, body.phoneNumber, body.orderId);
    }
    async verifyFlutterwavePayment(body) {
        return this.flutterwaveService.verifyPayment(body.txRef);
    }
    async processCOD(orderId) {
        return this.paymentManagementService.processCashOnDelivery(orderId);
    }
    async confirmCOD(orderId) {
        return this.paymentManagementService.confirmCODPayment(orderId);
    }
    async processBankTransfer(orderId, bankDetails) {
        return this.paymentManagementService.processBankTransfer(orderId, bankDetails);
    }
    async verifyBankTransfer(orderId, body) {
        return this.paymentManagementService.verifyBankTransfer(orderId, body.referenceNumber);
    }
    async processRefund(body) {
        return this.paymentManagementService.processRefund(body.paymentId, body.amount, body.reason);
    }
    async getPaymentDashboard() {
        return this.paymentManagementService.getPaymentDashboard();
    }
    async getTransactionHistory(query) {
        return this.paymentManagementService.getTransactionHistory(query.page, query.limit);
    }
    async retryPayment(paymentId) {
        return this.paymentRetryService.retryFailedPayment(paymentId);
    }
    async createPartialPaymentPlan(orderId, body) {
        return this.partialPaymentService.createPartialPaymentPlan(orderId, body.installments);
    }
    async payInstallment(installmentId, paymentData) {
        return this.partialPaymentService.processPartialPayment(installmentId, paymentData);
    }
    async getPaymentAnalytics(query) {
        return this.paymentAnalyticsService.getPaymentAnalytics(new Date(query.startDate), new Date(query.endDate));
    }
    async generateInvoice(orderId) {
        const path = await this.invoiceService.generateInvoice(orderId);
        return { message: 'Invoice generated', path };
    }
    async sendPaymentNotification(orderId) {
        await this.notificationService.sendPaymentConfirmationEmail(orderId);
        await this.notificationService.sendPaymentConfirmationSMS(orderId);
        return { message: 'Notifications sent' };
    }
    async createSecureSession(body) {
        return this.paymentSecurityService.createSecurePaymentSession(body.orderId, body.paymentMethod);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('mpesa/initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('mpesa/callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "mpesaCallback", null);
__decorate([
    (0, common_1.Get)('status/:checkoutRequestId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('checkoutRequestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Post)('stripe/create-intent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createStripePayment", null);
__decorate([
    (0, common_1.Post)('stripe/confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmStripePayment", null);
__decorate([
    (0, common_1.Post)('flutterwave/initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiateFlutterwavePayment", null);
__decorate([
    (0, common_1.Post)('flutterwave/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyFlutterwavePayment", null);
__decorate([
    (0, common_1.Post)('cod/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processCOD", null);
__decorate([
    (0, common_1.Put)('cod/:orderId/confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmCOD", null);
__decorate([
    (0, common_1.Post)('bank-transfer/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processBankTransfer", null);
__decorate([
    (0, common_1.Put)('bank-transfer/:orderId/verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyBankTransfer", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processRefund", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentDashboard", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Post)('retry/:paymentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "retryPayment", null);
__decorate([
    (0, common_1.Post)('partial/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPartialPaymentPlan", null);
__decorate([
    (0, common_1.Post)('partial/pay/:installmentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('installmentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "payInstallment", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentAnalytics", null);
__decorate([
    (0, common_1.Post)('invoice/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Post)('notify/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "sendPaymentNotification", null);
__decorate([
    (0, common_1.Post)('secure-session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSecureSession", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [mpesa_service_1.MpesaService,
        stripe_service_1.StripeService,
        flutterwave_service_1.FlutterwaveService,
        payment_management_service_1.PaymentManagementService,
        payment_retry_service_1.PaymentRetryService,
        partial_payment_service_1.PartialPaymentService,
        payment_analytics_service_1.PaymentAnalyticsService,
        invoice_service_1.InvoiceService,
        notification_service_1.NotificationService,
        payment_security_service_1.PaymentSecurityService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map