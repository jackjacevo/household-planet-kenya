import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async recordConsent(userId: number, consentType: string, granted: boolean) {
    return this.prisma.userConsent.create({
      data: {
        userId: userId.toString(),
        type: consentType,
        granted,
        timestamp: new Date(),
      },
    });
  }

  async getUserConsents(userId: number) {
    return this.prisma.userConsent.findMany({
      where: { userId: userId.toString() },
      orderBy: { timestamp: 'desc' },
    });
  }

  async updatePrivacySettings(userId: number, settings: any) {
    return this.prisma.user.update({
      where: { id: userId.toString() },
      data: { privacySettings: settings },
    });
  }

  async requestDataDeletion(userId: number, reason?: string) {
    await this.prisma.dataDeletionRequest.create({
      data: {
        userId: userId.toString(),
        reason,
        status: 'PENDING',
        requestedAt: new Date(),
      },
    });

    // Schedule deletion after 30 days
    setTimeout(async () => {
      await this.executeDataDeletion(userId);
    }, 30 * 24 * 60 * 60 * 1000);
  }

  private async executeDataDeletion(userId: number) {
    await this.prisma.$transaction([
      this.prisma.userConsent.deleteMany({ where: { userId: userId.toString() } }),
      this.prisma.order.deleteMany({ where: { userId: userId.toString() } }),
      this.prisma.cart.deleteMany({ where: { userId: userId.toString() } }),
      this.prisma.user.delete({ where: { id: userId.toString() } }),
    ]);
  }

  async logDataBreach(description: string, affectedUsers: number[]) {
    const breach = await this.prisma.dataBreach.create({
      data: {
        type: 'DATA_BREACH',
        severity: 'HIGH',
        description,
        affectedUsers: affectedUsers.length,
      },
    });

    // Notify authorities within 72 hours
    this.scheduleBreachNotification(breach.id);
    return breach;
  }

  private scheduleBreachNotification(breachId: string) {
    setTimeout(async () => {
      // Send notification to data protection authority
      console.log(`Breach notification required for breach ${breachId}`);
    }, 72 * 60 * 60 * 1000);
  }
}