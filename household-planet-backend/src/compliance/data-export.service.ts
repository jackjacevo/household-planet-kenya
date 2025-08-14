import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataExportService {
  constructor(private prisma: PrismaService) {}

  async exportUserData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId.toString() },
      include: {
        orders: {
          include: {
            items: {
              include: { product: true },
            },
            payments: true,
          },
        },
        cart: {
          include: {
            product: true,
          },
        },
        addresses: true,
        reviews: {
          include: { product: true },
        },
      },
    });

    if (!user) throw new Error('User not found');

    const exportData = {
      personalData: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      addresses: user?.addresses || [],
      orders: user?.orders?.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
        payments: order.payments,
      })) || [],
      cart: user?.cart || [],
      reviews: user?.reviews || [],
      consents: await this.prisma.userConsent.findMany({
        where: { userId: userId.toString() },
      }),
      cookieConsents: await this.prisma.cookieConsent.findMany({
        where: { sessionId: user.id.toString() },
      }),
    };

    const fileName = `user_data_export_${userId}_${Date.now()}.json`;
    const filePath = path.join('./exports', fileName);
    
    // Ensure exports directory exists
    if (!fs.existsSync('./exports')) {
      fs.mkdirSync('./exports', { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

    // Log export request
    await this.prisma.dataExportRequest.create({
      data: {
        userId: userId.toString(),
        fileName,
        status: 'COMPLETED',
        requestedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return { fileName, filePath, data: exportData };
  }

  async getExportHistory(userId: number) {
    return this.prisma.dataExportRequest.findMany({
      where: { userId: userId.toString() },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async cleanupOldExports() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldExports = await this.prisma.dataExportRequest.findMany({
      where: {
        completedAt: { lt: thirtyDaysAgo },
      },
    });

    for (const exportRecord of oldExports) {
      const filePath = path.join('./exports', exportRecord.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.prisma.dataExportRequest.deleteMany({
      where: {
        completedAt: { lt: thirtyDaysAgo },
      },
    });
  }
}