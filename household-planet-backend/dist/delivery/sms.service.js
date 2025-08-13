"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
let SmsService = class SmsService {
    constructor() {
        this.apiKey = process.env.AFRICAS_TALKING_API_KEY || 'demo';
        this.username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';
    }
    async sendSms(phoneNumber, message) {
        console.log(`SMS to ${phoneNumber}: ${message}`);
        return { success: true, messageId: `msg_${Date.now()}` };
    }
    async sendOrderConfirmation(phoneNumber, orderNumber) {
        const message = `Order ${orderNumber} confirmed! We'll notify you when it's out for delivery.`;
        return this.sendSms(phoneNumber, message);
    }
    async sendDeliveryUpdate(phoneNumber, orderNumber, status) {
        const message = `Order ${orderNumber} update: ${status}. Track your order for more details.`;
        return this.sendSms(phoneNumber, message);
    }
    async sendDeliveryConfirmation(phoneNumber, orderNumber) {
        const message = `Order ${orderNumber} delivered successfully! Please rate your delivery experience.`;
        return this.sendSms(phoneNumber, message);
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = __decorate([
    (0, common_1.Injectable)()
], SmsService);
//# sourceMappingURL=sms.service.js.map