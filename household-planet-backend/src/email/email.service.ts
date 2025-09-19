import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  // Welcome email series
  async sendWelcomeEmail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const template = await this.getTemplate('welcome');
    await this.sendEmail(user.email, template.subject, this.replaceVariables(template.htmlContent, { name: user.name }));
    
    // Schedule follow-up emails
    setTimeout(() => this.sendWelcomeEmail2(userId), 24 * 60 * 60 * 1000); // 1 day
    setTimeout(() => this.sendWelcomeEmail3(userId), 3 * 24 * 60 * 60 * 1000); // 3 days
  }

  private async sendWelcomeEmail2(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    const template = await this.getTemplate('welcome-2');
    await this.sendEmail(user.email, template.subject, this.replaceVariables(template.htmlContent, { name: user.name }));
  }

  private async sendWelcomeEmail3(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    const template = await this.getTemplate('welcome-3');
    await this.sendEmail(user.email, template.subject, this.replaceVariables(template.htmlContent, { name: user.name }));
  }

  // Abandoned cart recovery
  async sendAbandonedCartEmail(userId: number) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { cart: { include: { product: true } } }
    });
    
    if (!user || user.cart.length === 0) return;

    const template = await this.getTemplate('abandoned-cart-1');
    const cartItems = user.cart.map(item => `${item.product.name} (${item.quantity})`).join(', ');
    
    await this.sendEmail(user.email, template.subject, 
      this.replaceVariables(template.htmlContent, { name: user.name, cartItems }));
    
    // Schedule follow-up emails
    setTimeout(() => this.sendAbandonedCartEmail2(userId), 24 * 60 * 60 * 1000);
    setTimeout(() => this.sendAbandonedCartEmail3(userId), 3 * 24 * 60 * 60 * 1000);
  }

  private async sendAbandonedCartEmail2(userId: number) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { cart: { include: { product: true } } }
    });
    
    if (!user || user.cart.length === 0) return;

    const template = await this.getTemplate('abandoned-cart-2');
    await this.sendEmail(user.email, template.subject, 
      this.replaceVariables(template.htmlContent, { name: user.name }));
  }

  private async sendAbandonedCartEmail3(userId: number) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { cart: { include: { product: true } } }
    });
    
    if (!user || user.cart.length === 0) return;

    const template = await this.getTemplate('abandoned-cart-3');
    await this.sendEmail(user.email, template.subject, 
      this.replaceVariables(template.htmlContent, { name: user.name }));
  }

  // Order confirmation
  async sendOrderConfirmation(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: { include: { product: true } } }
    });

    if (!order) return;

    const template = await this.getTemplate('order-confirmation');
    const orderItems = order.items.map(item => `${item.product.name} x${item.quantity}`).join(', ');
    
    await this.sendEmail(order.user.email, template.subject,
      this.replaceVariables(template.htmlContent, {
        name: order.user.name,
        orderNumber: order.orderNumber,
        total: order.total.toString(),
        items: orderItems
      }));
  }

  // Shipping notification
  async sendShippingNotification(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) return;

    const template = await this.getTemplate('shipping-notification');
    await this.sendEmail(order.user.email, template.subject,
      this.replaceVariables(template.htmlContent, {
        name: order.user.name,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber || 'N/A'
      }));
  }

  // Delivery confirmation
  async sendDeliveryConfirmation(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) return;

    const template = await this.getTemplate('delivery-confirmation');
    await this.sendEmail(order.user.email, template.subject,
      this.replaceVariables(template.htmlContent, {
        name: order.user.name,
        orderNumber: order.orderNumber
      }));

    // Schedule review reminder
    setTimeout(() => this.sendReviewReminder(orderId), 3 * 24 * 60 * 60 * 1000);
  }

  // Review reminder
  async sendReviewReminder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: { include: { product: true } } }
    });

    if (!order) return;

    const template = await this.getTemplate('review-reminder');
    const products = order.items.map(item => item.product.name).join(', ');
    
    await this.sendEmail(order.user.email, template.subject,
      this.replaceVariables(template.htmlContent, {
        name: order.user.name,
        products
      }));
  }

  // Birthday offer
  async sendBirthdayOffer(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const template = await this.getTemplate('birthday-offer');
    await this.sendEmail(user.email, template.subject,
      this.replaceVariables(template.htmlContent, { name: user.name }));
  }

  // Newsletter
  async sendNewsletter(userIds: number[]) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    const template = await this.getTemplate('newsletter');
    
    for (const user of users) {
      await this.sendEmail(user.email, template.subject,
        this.replaceVariables(template.htmlContent, { name: user.name }));
    }
  }

  // Customer reactivation
  async sendReactivationEmail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const template = await this.getTemplate('reactivation');
    await this.sendEmail(user.email, template.subject,
      this.replaceVariables(template.htmlContent, { name: user.name }));
  }

  // Template management
  async createTemplate(name: string, subject: string, htmlContent: string, variables?: any) {
    return this.prisma.emailTemplate.create({
      data: { name, subject, htmlContent, variables }
    });
  }

  async updateTemplate(name: string, data: any) {
    return this.prisma.emailTemplate.update({
      where: { name },
      data
    });
  }

  private async getTemplate(name: string) {
    return this.prisma.emailTemplate.findUnique({ where: { name } });
  }

  private replaceVariables(content: string, variables: Record<string, string>) {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    // Mock email sending - replace with actual email service
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html.substring(0, 100)}...`);
    
    // Log to database
    await this.prisma.customerCommunication.create({
      data: {
        profileId: 1, // This should be dynamic based on user
        type: 'EMAIL',
        subject,
        message: html,
        channel: 'EMAIL',
        status: 'SENT'
      }
    });
  }
}
