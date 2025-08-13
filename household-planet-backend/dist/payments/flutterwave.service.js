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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterwaveService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
let FlutterwaveService = class FlutterwaveService {
    constructor(prisma) {
        this.prisma = prisma;
        this.baseUrl = 'https://api.flutterwave.com/v3';
    }
    async initiatePayment(amount, email, phoneNumber, orderId) {
        try {
            const payload = {
                tx_ref: `HHP-${orderId}-${Date.now()}`,
                amount,
                currency: 'KES',
                redirect_url: `${process.env.BASE_URL}/payment/callback`,
                customer: { email, phonenumber: phoneNumber },
                customizations: {
                    title: 'Household Planet Kenya',
                    description: 'Payment for order'
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/payments`, payload, {
                headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
            });
            await this.prisma.payment.create({
                data: {
                    orderId,
                    checkoutRequestId: payload.tx_ref,
                    amount,
                    phoneNumber,
                    status: 'PENDING',
                    paymentMethod: 'FLUTTERWAVE'
                }
            });
            return {
                paymentLink: response.data.data.link,
                txRef: payload.tx_ref
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to initiate Flutterwave payment');
        }
    }
    async verifyPayment(txRef) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${txRef}`, {
                headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
            });
            const payment = await this.prisma.payment.findFirst({
                where: { checkoutRequestId: txRef }
            });
            if (payment && response.data.data.status === 'successful') {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'COMPLETED', mpesaReceiptNumber: response.data.data.flw_ref }
                });
                await this.prisma.order.update({
                    where: { id: payment.orderId },
                    data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
                });
            }
            return { status: response.data.data.status };
        }
        catch (error) {
            throw new common_1.BadRequestException('Payment verification failed');
        }
    }
};
exports.FlutterwaveService = FlutterwaveService;
exports.FlutterwaveService = FlutterwaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlutterwaveService);
//# sourceMappingURL=flutterwave.service.js.map