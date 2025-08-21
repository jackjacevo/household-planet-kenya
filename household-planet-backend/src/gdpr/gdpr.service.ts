import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CookieConsentDto, DataExportRequestDto, DataDeletionRequestDto, ConsentUpdateDto, PrivacySettingsDto } from './dto/gdpr.dto';

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  async updateCookieConsent(userId: number | string, consentDto: CookieConsentDto) {
    // For anonymous users, just return success without storing in database
    if (typeof userId === 'string' && userId !== 'anonymous') {
      // Handle session-based storage if needed
      return { success: true, message: 'Cookie preferences saved locally' };
    }
    
    if (typeof userId === 'string' || !userId) {
      return { success: true, message: 'Cookie preferences saved locally' };
    }

    return this.prisma.userConsent.upsert({
      where: { userId },
      update: {
        cookieConsent: consentDto as any,
        updatedAt: new Date(),
      },
      create: {
        userId,
        cookieConsent: consentDto as any,
        consentVersion: '1.0',
      },
    });
  }

  async getCookieConsent(userId: number | string) {
    // For anonymous users, return default preferences
    if (typeof userId === 'string' || !userId) {
      return {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      };
    }

    const consent = await this.prisma.userConsent.findUnique({
      where: { userId },
    });
    return consent?.cookieConsent || {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
  }

  async requestDataExport(userId: number, requestDto: DataExportRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        reviews: true,
        addresses: true,
        cart: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const exportData = {
      personalInfo: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      orders: user.orders,
      reviews: user.reviews,
      addresses: user.addresses,
      cart: user.cart,
      exportedAt: new Date(),
      reason: requestDto.reason,
    };

    await this.prisma.dataExportRequest.create({
      data: {
        userId,
        reason: requestDto.reason,
        status: 'completed',
        exportData: JSON.stringify(exportData),
      },
    });

    return exportData;
  }

  async requestDataDeletion(userId: number, requestDto: DataDeletionRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletionRequest = await this.prisma.dataDeletionRequest.create({
      data: {
        userId,
        reason: requestDto.reason,
        status: 'pending',
        scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      requestId: deletionRequest.id,
      scheduledDeletion: deletionRequest.scheduledDeletion,
      message: 'Data deletion scheduled for 30 days. You can cancel this request within this period.',
    };
  }

  async cancelDataDeletion(userId: number, requestId: string) {
    const request = await this.prisma.dataDeletionRequest.findFirst({
      where: { id: requestId, userId, status: 'pending' },
    });

    if (!request) {
      throw new NotFoundException('Deletion request not found or already processed');
    }

    await this.prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: { status: 'cancelled' },
    });

    return { message: 'Data deletion request cancelled successfully' };
  }

  async updatePrivacySettings(userId: number, settingsDto: PrivacySettingsDto) {
    return this.prisma.userPrivacySettings.upsert({
      where: { userId },
      update: settingsDto,
      create: {
        userId,
        ...settingsDto,
      },
    });
  }

  async getPrivacySettings(userId: number) {
    const settings = await this.prisma.userPrivacySettings.findUnique({
      where: { userId },
    });

    return settings || {
      profileVisibility: true,
      dataProcessing: true,
      marketingEmails: false,
      analyticsTracking: false,
    };
  }

  async updateConsent(userId: number, consentDto: ConsentUpdateDto) {
    return this.prisma.consentLog.create({
      data: {
        userId,
        consentType: consentDto.type,
        granted: consentDto.granted,
        purpose: consentDto.purpose,
        ipAddress: '0.0.0.0', // Should be passed from controller
        userAgent: 'Unknown', // Should be passed from controller
      },
    });
  }

  async getConsentHistory(userId: number) {
    return this.prisma.consentLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processScheduledDeletions() {
    const pendingDeletions = await this.prisma.dataDeletionRequest.findMany({
      where: {
        status: 'pending',
        scheduledDeletion: { lte: new Date() },
      },
    });

    for (const deletion of pendingDeletions) {
      await this.deleteUserData(deletion.userId);
      await this.prisma.dataDeletionRequest.update({
        where: { id: deletion.id },
        data: { status: 'completed' },
      });
    }

    return { processed: pendingDeletions.length };
  }

  private async deleteUserData(userId: number) {
    await this.prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { userId } });
      await tx.orderItem.deleteMany({ where: { order: { userId } } });
      await tx.order.deleteMany({ where: { userId } });
      await tx.cart.deleteMany({ where: { userId } });
      await tx.address.deleteMany({ where: { userId } });
      await tx.userConsent.deleteMany({ where: { userId } });
      await tx.userPrivacySettings.deleteMany({ where: { userId } });
      await tx.consentLog.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  }
}