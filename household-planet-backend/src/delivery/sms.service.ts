import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private apiKey = process.env.AFRICAS_TALKING_API_KEY || 'demo';
  private username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';

  async sendSms(phoneNumber: string, message: string) {
    // Mock implementation - replace with actual Africa's Talking integration
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  async sendOrderConfirmation(phoneNumber: string, orderNumber: string) {
    const message = `Order ${orderNumber} confirmed! We'll notify you when it's out for delivery.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendDeliveryUpdate(phoneNumber: string, orderNumber: string, status: string) {
    const message = `Order ${orderNumber} update: ${status}. Track your order for more details.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendDeliveryConfirmation(phoneNumber: string, orderNumber: string) {
    const message = `Order ${orderNumber} delivered successfully! Please rate your delivery experience.`;
    return this.sendSms(phoneNumber, message);
  }
}