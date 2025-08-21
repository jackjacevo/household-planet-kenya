import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailAutomationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  // Check for abandoned carts daily
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkAbandonedCarts() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const abandonedCarts = await this.prisma.cart.findMany({
      where: {
        createdAt: { lt: yesterday }
      },
      include: { user: true },
      distinct: ['userId']
    });

    for (const cart of abandonedCarts) {
      await this.emailService.sendAbandonedCartEmail(cart.userId);
    }
  }

  // Check for birthdays daily
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkBirthdays() {
    const today = new Date().toISOString().slice(5, 10); // MM-DD format

    const users = await this.prisma.user.findMany({
      where: {
        dateOfBirth: { contains: today }
      }
    });

    for (const user of users) {
      await this.emailService.sendBirthdayOffer(user.id);
    }
  }

  // Check for inactive customers monthly
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async checkInactiveCustomers() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        orders: {
          none: {
            createdAt: { gte: threeMonthsAgo }
          }
        }
      }
    });

    for (const user of inactiveUsers) {
      await this.emailService.sendReactivationEmail(user.id);
    }
  }

  // Send weekly newsletter
  @Cron(CronExpression.EVERY_WEEK)
  async sendWeeklyNewsletter() {
    const activeUsers = await this.prisma.user.findMany({
      where: {
        emailVerified: true
      }
    });

    const userIds = activeUsers.map(user => user.id);
    await this.emailService.sendNewsletter(userIds);
  }
}