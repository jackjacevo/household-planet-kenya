import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendOrderUpdate(orderId: string, status: string) {
    // Push notification logic would go here
    console.log(`Order ${orderId} status: ${status}`);
  }
}