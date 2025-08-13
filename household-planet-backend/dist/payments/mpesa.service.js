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
var MpesaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
let MpesaService = MpesaService_1 = class MpesaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MpesaService_1.name);
        this.baseUrl = 'https://sandbox.safaricom.co.ke';
        this.businessShortCode = '247247';
        this.passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    }
    async getAccessToken() {
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: { Authorization: `Basic ${auth}` }
            });
            return response.data.access_token;
        }
        catch (error) {
            this.logger.error('Failed to get M-Pesa access token', error);
            throw new common_1.BadRequestException('Payment service unavailable');
        }
    }
    generatePassword() {
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        return Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    }
    async initiateSTKPush(phoneNumber, amount, orderId) {
        const accessToken = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = this.generatePassword();
        const payload = {
            BusinessShortCode: this.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: phoneNumber,
            PartyB: this.businessShortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: `${process.env.BASE_URL}/api/payments/mpesa/callback`,
            AccountReference: '0740271041',
            TransactionDesc: 'Household Planet Kenya Payment'
        };
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            await this.prisma.payment.create({
                data: {
                    orderId,
                    checkoutRequestId: response.data.CheckoutRequestID,
                    merchantRequestId: response.data.MerchantRequestID,
                    amount,
                    phoneNumber,
                    status: 'PENDING'
                }
            });
            return {
                checkoutRequestId: response.data.CheckoutRequestID,
                responseCode: response.data.ResponseCode,
                responseDescription: response.data.ResponseDescription
            };
        }
        catch (error) {
            this.logger.error('STK Push failed', error);
            throw new common_1.BadRequestException('Payment initiation failed');
        }
    }
    async handleCallback(callbackData) {
        const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData.Body.stkCallback;
        const payment = await this.prisma.payment.findFirst({
            where: { checkoutRequestId: CheckoutRequestID },
            include: { order: true }
        });
        if (!payment)
            return;
        if (ResultCode === 0) {
            const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata?.Item || [];
            const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'COMPLETED',
                    mpesaReceiptNumber,
                    transactionDate: transactionDate ? new Date(transactionDate.toString()) : new Date()
                }
            });
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
            });
            this.logger.log(`Payment completed for order ${payment.orderId}`);
        }
        else {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED', failureReason: ResultDesc }
            });
            this.logger.warn(`Payment failed for order ${payment.orderId}: ${ResultDesc}`);
        }
    }
    async checkPaymentStatus(checkoutRequestId) {
        const payment = await this.prisma.payment.findFirst({
            where: { checkoutRequestId },
            include: { order: true }
        });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        return {
            status: payment.status,
            amount: payment.amount,
            orderNumber: payment.order.orderNumber,
            mpesaReceiptNumber: payment.mpesaReceiptNumber
        };
    }
};
exports.MpesaService = MpesaService;
exports.MpesaService = MpesaService = MpesaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MpesaService);
//# sourceMappingURL=mpesa.service.js.map