import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GdprService } from './gdpr.service';

@Injectable()
export class GdprSchedulerService {
  private readonly logger = new Logger(GdprSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private gdprService: GdprService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processScheduledDeletions() {
    this.logger.log('Processing scheduled data deletions...');
    
    try {
      const result = await this.gdprService.processScheduledDeletions();
      this.logger.log(`Processed ${result.processed} scheduled deletions`);
    } catch (error) {
      this.logger.error('Failed to process scheduled deletions:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupExpiredData() {
    this.logger.log('Cleaning up expired data...');
    
    try {
      // Clean up old export requests (older than 30 days)
      const deletedExports = await this.prisma.dataExportRequest.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Clean up old consent logs (older than 2 years)
      const deletedConsents = await this.prisma.consentLog.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
          },
        },
      });

      this.logger.log(`Cleaned up ${deletedExports.count} export requests and ${deletedConsents.count} consent logs`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired data:', error);
    }
  }

  @Cron('0 0 1 * *') // First day of every month at midnight
  async generateComplianceReport() {
    this.logger.log('Generating monthly compliance report...');
    
    try {
      const stats = await this.getComplianceStats();
      
      // Log compliance metrics
      this.logger.log('Compliance Report:', {
        totalUsers: stats.totalUsers,
        activeConsents: stats.activeConsents,
        exportRequests: stats.exportRequests,
        deletionRequests: stats.deletionRequests,
        dataBreaches: stats.dataBreaches,
      });
      
      // In a real implementation, you might send this to monitoring systems
    } catch (error) {
      this.logger.error('Failed to generate compliance report:', error);
    }
  }

  private async getComplianceStats() {
    const [
      totalUsers,
      activeConsents,
      exportRequests,
      deletionRequests,
      dataBreaches,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.userConsent.count(),
      this.prisma.dataExportRequest.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.dataDeletionRequest.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.dataBreachLog.count({
        where: {
          reportedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeConsents,
      exportRequests,
      deletionRequests,
      dataBreaches,
    };
  }
}