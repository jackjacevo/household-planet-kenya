import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailTemplateSeederService {
  constructor(private prisma: PrismaService) {}

  async seedTemplates() {
    const templates = [
      {
        name: 'welcome',
        subject: 'Welcome to Household Planet Kenya! 🏠',
        htmlContent: this.loadTemplate('welcome.html')
      },
      {
        name: 'welcome-2',
        subject: 'Discover Amazing Deals at Household Planet Kenya',
        htmlContent: `<h2>Hi {{name}},</h2><p>Ready to explore our amazing collection? Check out our featured products and special offers!</p>`
      },
      {
        name: 'welcome-3',
        subject: 'Complete Your Profile & Get 10% Off',
        htmlContent: `<h2>Hi {{name}},</h2><p>Complete your profile and get 10% off your first order!</p>`
      },
      {
        name: 'abandoned-cart-1',
        subject: 'You left something in your cart 🛒',
        htmlContent: this.loadTemplate('abandoned-cart.html')
      },
      {
        name: 'abandoned-cart-2',
        subject: 'Still thinking? Get 5% off your cart items',
        htmlContent: `<h2>Hi {{name}},</h2><p>Get 5% off the items in your cart. Use code: SAVE5</p>`
      },
      {
        name: 'abandoned-cart-3',
        subject: 'Last chance - 10% off your cart!',
        htmlContent: `<h2>Hi {{name}},</h2><p>This is your last chance! Get 10% off with code: LASTCHANCE</p>`
      },
      {
        name: 'order-confirmation',
        subject: 'Order Confirmed - {{orderNumber}}',
        htmlContent: `<h2>Hi {{name}},</h2><p>Your order {{orderNumber}} has been confirmed!</p><p>Total: KSh {{total}}</p><p>Items: {{items}}</p>`
      },
      {
        name: 'shipping-notification',
        subject: 'Your order is on the way! 🚚',
        htmlContent: `<h2>Hi {{name}},</h2><p>Great news! Your order {{orderNumber}} has been shipped.</p><p>Tracking: {{trackingNumber}}</p>`
      },
      {
        name: 'delivery-confirmation',
        subject: 'Order Delivered Successfully ✅',
        htmlContent: `<h2>Hi {{name}},</h2><p>Your order {{orderNumber}} has been delivered successfully!</p><p>We hope you love your purchase!</p>`
      },
      {
        name: 'review-reminder',
        subject: 'How was your experience? Leave a review',
        htmlContent: `<h2>Hi {{name}},</h2><p>How did you like {{products}}? Your review helps other customers!</p>`
      },
      {
        name: 'birthday-offer',
        subject: '🎉 Happy Birthday! Special gift inside',
        htmlContent: `<h2>Happy Birthday {{name}}! 🎂</h2><p>Celebrate with 15% off your next order! Use code: BIRTHDAY15</p>`
      },
      {
        name: 'newsletter',
        subject: 'Weekly Deals & New Arrivals',
        htmlContent: `<h2>Hi {{name}},</h2><p>Check out this week's best deals and new arrivals at Household Planet Kenya!</p>`
      },
      {
        name: 'reactivation',
        subject: 'We miss you! Come back for exclusive offers',
        htmlContent: `<h2>Hi {{name}},</h2><p>We miss you! Come back and enjoy 20% off your next order with code: WELCOME20</p>`
      }
    ];

    for (const template of templates) {
      await this.prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template
      });
    }

    console.log('Email templates seeded successfully');
  }

  private loadTemplate(filename: string): string {
    try {
      const templatePath = path.join(__dirname, 'templates', filename);
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      return `<h2>Template {{name}}</h2><p>Default template content</p>`;
    }
  }
}
