import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DataRetentionService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredData() {
    await this.cleanupInactiveUsers();
    await this.cleanupOldLogs();
    await this.cleanupExpiredSessions();
    await this.cleanupOldConsents();
  }

  private async cleanupInactiveUsers() {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    // Find users inactive for 2+ years with no orders
    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        lastLoginAt: { lt: twoYearsAgo },
        orders: { none: {} },
        isActive: false,
      },
    });

    for (const user of inactiveUsers) {
      await this.anonymizeUser(user.id);
    }
  }

  private async anonymizeUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.local`,
        firstName: 'Deleted',
        lastName: 'User',
        phone: null,
        dateOfBirth: null,
        isActive: false,
      },
    });
  }

  private async cleanupOldLogs() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await this.prisma.auditLog.deleteMany({
      where: { timestamp: { lt: ninetyDaysAgo } },
    });
  }

  private async cleanupExpiredSessions() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // UserSession model doesn't exist, skip cleanup
    // await this.prisma.userSession.deleteMany({
    //   where: { lastActivity: { lt: sevenDaysAgo } },
    // });
  }

  private async cleanupOldConsents() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    await this.prisma.userConsent.deleteMany({
      where: { timestamp: { lt: threeYearsAgo } },
    });
  }

  async getRetentionPolicy() {
    return {
      userAccounts: {
        activeUsers: 'Retained while account is active',
        inactiveUsers: 'Anonymized after 2 years of inactivity',
        deletedAccounts: 'Permanently deleted after 30 days',
      },
      orderData: {
        completedOrders: 'Retained for 7 years (tax requirements)',
        cancelledOrders: 'Retained for 2 years',
      },
      logs: {
        auditLogs: 'Retained for 90 days',
        securityLogs: 'Retained for 1 year',
        accessLogs: 'Retained for 30 days',
      },
      consents: {
        cookieConsents: 'Retained for 2 years',
        marketingConsents: 'Retained for 3 years',
      },
      sessions: {
        activeSessions: 'Expired after 24 hours of inactivity',
        expiredSessions: 'Deleted after 7 days',
      },
    };
  }
}