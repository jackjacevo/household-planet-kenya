import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, templateData?: any) {
    try {
      const result = await this.transporter.sendMail({
        from: `"Household Planet Kenya" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      await this.logEmail(to, subject, 'SENT', templateData?.templateName);
      return result;
    } catch (error) {
      await this.logEmail(to, subject, 'FAILED', templateData?.templateName, error.message);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string) {
    const template = await this.getTemplate('welcome');
    const html = this.renderTemplate(template.content, {
      userName,
      shopUrl: process.env.BASE_URL || 'https://householdplanet.co.ke',
    });

    return this.sendEmail(userEmail, 'Welcome to Household Planet Kenya!', html, {
      templateName: 'welcome'
    });
  }

  async sendOrderConfirmation(userEmail: string, orderData: any) {
    const template = await this.getTemplate('order_confirmation');
    const html = this.renderTemplate(template.content, {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      orderTotal: orderData.total,
      orderItems: orderData.items,
      trackingUrl: `${process.env.BASE_URL}/orders/${orderData.orderNumber}`,
    });

    return this.sendEmail(userEmail, `Order Confirmation #${orderData.orderNumber}`, html, {
      templateName: 'order_confirmation'
    });
  }

  async sendAbandonedCartEmail(userEmail: string, cartData: any, sequence: number = 1) {
    const templates = {
      1: 'abandoned_cart_1',
      2: 'abandoned_cart_2', 
      3: 'abandoned_cart_3'
    };

    const template = await this.getTemplate(templates[sequence]);
    const html = this.renderTemplate(template.content, {
      customerName: cartData.customerName,
      cartItems: cartData.items,
      cartTotal: cartData.total,
      cartUrl: `${process.env.BASE_URL}/cart`,
      discountCode: sequence === 3 ? 'SAVE15' : null,
    });

    const subjects = {
      1: 'You left something in your cart',
      2: 'Still thinking about your cart?',
      3: 'Last chance - 15% off your cart!'
    };

    return this.sendEmail(userEmail, subjects[sequence], html, {
      templateName: templates[sequence]
    });
  }

  async sendShippingNotification(userEmail: string, orderData: any) {
    const template = await this.getTemplate('shipping_notification');
    const html = this.renderTemplate(template.content, {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      trackingNumber: orderData.trackingNumber,
      estimatedDelivery: orderData.estimatedDelivery,
      trackingUrl: `${process.env.BASE_URL}/orders/${orderData.orderNumber}`,
    });

    return this.sendEmail(userEmail, `Your order #${orderData.orderNumber} has shipped!`, html, {
      templateName: 'shipping_notification'
    });
  }

  async sendDeliveryConfirmation(userEmail: string, orderData: any) {
    const template = await this.getTemplate('delivery_confirmation');
    const html = this.renderTemplate(template.content, {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      reviewUrl: `${process.env.BASE_URL}/orders/${orderData.orderNumber}/review`,
    });

    return this.sendEmail(userEmail, `Order #${orderData.orderNumber} delivered!`, html, {
      templateName: 'delivery_confirmation'
    });
  }

  async sendReviewReminder(userEmail: string, orderData: any) {
    const template = await this.getTemplate('review_reminder');
    const html = this.renderTemplate(template.content, {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      reviewUrl: `${process.env.BASE_URL}/orders/${orderData.orderNumber}/review`,
    });

    return this.sendEmail(userEmail, 'How was your recent purchase?', html, {
      templateName: 'review_reminder'
    });
  }

  async sendBirthdayOffer(userEmail: string, userData: any) {
    const template = await this.getTemplate('birthday_offer');
    const html = this.renderTemplate(template.content, {
      customerName: userData.name,
      discountCode: 'BIRTHDAY20',
      shopUrl: `${process.env.BASE_URL}`,
    });

    return this.sendEmail(userEmail, 'Happy Birthday! Special offer inside 🎉', html, {
      templateName: 'birthday_offer'
    });
  }

  async sendNewsletter(userEmail: string, newsletterData: any) {
    const template = await this.getTemplate('newsletter');
    const html = this.renderTemplate(template.content, {
      customerName: newsletterData.customerName,
      featuredProducts: newsletterData.products,
      promotions: newsletterData.promotions,
      shopUrl: `${process.env.BASE_URL}`,
    });

    return this.sendEmail(userEmail, newsletterData.subject, html, {
      templateName: 'newsletter'
    });
  }

  @Cron('0 9 * * *') // Daily at 9 AM
  async processAbandonedCarts() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // First email after 24 hours
    const firstReminders = await this.prisma.abandonedCart.findMany({
      where: {
        isRecovered: false,
        remindersSent: 0,
        createdAt: { lte: oneDayAgo, gte: threeDaysAgo },
      },
      include: { user: true },
    });

    for (const cart of firstReminders) {
      if (cart.user?.email) {
        await this.sendAbandonedCartEmail(cart.user.email, {
          customerName: cart.user.name,
          items: JSON.parse(cart.cartData || '[]'),
          total: 0,
        }, 1);

        await this.prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { remindersSent: 1 },
        });
      }
    }

    // Second email after 3 days
    const secondReminders = await this.prisma.abandonedCart.findMany({
      where: {
        isRecovered: false,
        remindersSent: 1,
        createdAt: { lte: threeDaysAgo, gte: sevenDaysAgo },
      },
      include: { user: true },
    });

    for (const cart of secondReminders) {
      if (cart.user?.email) {
        await this.sendAbandonedCartEmail(cart.user.email, {
          customerName: cart.user.name,
          items: JSON.parse(cart.cartData || '[]'),
          total: 0,
        }, 2);

        await this.prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { remindersSent: 2 },
        });
      }
    }

    // Third email after 7 days
    const thirdReminders = await this.prisma.abandonedCart.findMany({
      where: {
        isRecovered: false,
        remindersSent: 2,
        createdAt: { lte: sevenDaysAgo },
      },
      include: { user: true },
    });

    for (const cart of thirdReminders) {
      if (cart.user?.email) {
        await this.sendAbandonedCartEmail(cart.user.email, {
          customerName: cart.user.name,
          items: JSON.parse(cart.cartData || '[]'),
          total: 0,
        }, 3);

        await this.prisma.abandonedCart.update({
          where: { id: cart.id },
          data: { remindersSent: 3 },
        });
      }
    }
  }

  @Cron('0 10 * * *') // Daily at 10 AM
  async processBirthdayOffers() {
    const today = new Date();
    const todayString = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const birthdayUsers = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
    });

    for (const user of birthdayUsers) {
      await this.sendBirthdayOffer(user.email, user);
    }
  }

  private async getTemplate(name: string) {
    // Mock template for now
    return {
      name,
      content: `<html><body><h1>{{title}}</h1><p>{{content}}</p></body></html>`
    };
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value || ''));
    });

    return rendered;
  }

  private async logEmail(to: string, subject: string, status: string, templateName?: string, error?: string) {
    try {
      // Log to console for now
      this.logger.log(`Email ${status}: ${to} - ${subject}`);
    } catch (error) {
      this.logger.error('Failed to log email:', error);
    }
  }
}