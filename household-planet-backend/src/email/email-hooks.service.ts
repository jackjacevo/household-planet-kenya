import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class EmailHooksService {
  constructor(private emailService: EmailService) {}

  // Hook for user registration
  async onUserRegistered(userId: number) {
    await this.emailService.sendWelcomeEmail(userId);
  }

  // Hook for order creation
  async onOrderCreated(orderId: number) {
    await this.emailService.sendOrderConfirmation(orderId);
  }

  // Hook for order shipped
  async onOrderShipped(orderId: number) {
    await this.emailService.sendShippingNotification(orderId);
  }

  // Hook for order delivered
  async onOrderDelivered(orderId: number) {
    await this.emailService.sendDeliveryConfirmation(orderId);
  }

  // Hook for cart abandonment (called from cart service)
  async onCartAbandoned(userId: number) {
    await this.emailService.sendAbandonedCartEmail(userId);
  }
}