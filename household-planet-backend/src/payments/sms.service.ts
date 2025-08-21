import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendPaymentReceipt(phoneNumber: string, amount: number, receiptNumber: string, orderNumber: string): Promise<void> {
    try {
      const message = `Payment confirmed! KES ${amount} received for order ${orderNumber}. M-Pesa receipt: ${receiptNumber}. Thank you for shopping with Household Planet Kenya!`;
      
      // In production, integrate with SMS provider (e.g., Africa's Talking, Twilio)
      this.logger.log(`SMS Receipt sent to ${phoneNumber}: ${message}`);
      
      // Simulate SMS sending
      await this.delay(100);
    } catch (error) {
      this.logger.error('Failed to send SMS receipt', error);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}