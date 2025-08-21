import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private apiKey = process.env.AFRICAS_TALKING_API_KEY || 'sandbox';
  private username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';

  async sendDeliveryNotification(phoneNumber: string, message: string) {
    try {
      // Mock SMS sending for now - replace with actual Africa's Talking integration
      console.log(`SMS to ${phoneNumber}: ${message}`);
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        cost: 'KES 1.00'
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOrderConfirmation(phoneNumber: string, orderNumber: string, trackingNumber: string) {
    const message = `Order ${orderNumber} confirmed! Track your delivery: ${trackingNumber}. Expected delivery: 2-3 business days.`;
    return this.sendDeliveryNotification(phoneNumber, message);
  }

  async sendDeliveryUpdate(phoneNumber: string, trackingNumber: string, status: string) {
    const message = `Delivery Update: Your order ${trackingNumber} is now ${status.toLowerCase()}. Track: householdplanet.co.ke/track/${trackingNumber}`;
    return this.sendDeliveryNotification(phoneNumber, message);
  }

  async sendDeliveryScheduled(phoneNumber: string, trackingNumber: string, date: string, timeSlot: string) {
    const message = `Delivery scheduled for ${date} during ${timeSlot}. Tracking: ${trackingNumber}`;
    return this.sendDeliveryNotification(phoneNumber, message);
  }

  async sendDeliveryCompleted(phoneNumber: string, trackingNumber: string) {
    const message = `Your order ${trackingNumber} has been delivered successfully! Please rate your delivery experience.`;
    return this.sendDeliveryNotification(phoneNumber, message);
  }
}