"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const payments_controller_1 = require("./payments.controller");
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
const prisma_module_1 = require("../prisma/prisma.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [payments_controller_1.PaymentsController],
        providers: [
            mpesa_service_1.MpesaService,
            stripe_service_1.StripeService,
            flutterwave_service_1.FlutterwaveService,
            payment_management_service_1.PaymentManagementService,
            payment_retry_service_1.PaymentRetryService,
            partial_payment_service_1.PartialPaymentService,
            payment_analytics_service_1.PaymentAnalyticsService,
            invoice_service_1.InvoiceService,
            notification_service_1.NotificationService,
            payment_security_service_1.PaymentSecurityService
        ],
        exports: [
            mpesa_service_1.MpesaService,
            stripe_service_1.StripeService,
            flutterwave_service_1.FlutterwaveService,
            payment_management_service_1.PaymentManagementService,
            payment_retry_service_1.PaymentRetryService,
            partial_payment_service_1.PartialPaymentService,
            payment_analytics_service_1.PaymentAnalyticsService,
            invoice_service_1.InvoiceService,
            notification_service_1.NotificationService,
            payment_security_service_1.PaymentSecurityService
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map