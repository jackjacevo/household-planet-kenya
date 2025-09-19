import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DataBreachReport {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers?: number;
  actions?: any;
}

@Injectable()
export class DataBreachService {
  private readonly logger = new Logger(DataBreachService.name);

  constructor(private prisma: PrismaService) {}

  async reportBreach(breach: DataBreachReport) {
    this.logger.error(`Data breach reported: ${breach.type} - ${breach.severity}`);

    const breachLog = await this.prisma.dataBreachLog.create({
      data: {
        type: breach.type,
        severity: breach.severity,
        description: breach.description,
        affectedUsers: breach.affectedUsers || 0,
        actions: breach.actions ? JSON.stringify(breach.actions) : null,
      },
    });

    // Immediate actions based on severity
    if (breach.severity === 'critical' || breach.severity === 'high') {
      await this.handleHighSeverityBreach(breachLog.id, breach);
    }

    return breachLog;
  }

  async updateBreachStatus(breachId: string, status: string, actions?: any) {
    return this.prisma.dataBreachLog.update({
      where: { id: breachId },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
        actions: actions ? JSON.stringify(actions) : undefined,
      },
    });
  }

  async getActiveBreaches() {
    return this.prisma.dataBreachLog.findMany({
      where: {
        status: { not: 'resolved' },
      },
      orderBy: { reportedAt: 'desc' },
    });
  }

  async getBreachHistory(limit = 50) {
    return this.prisma.dataBreachLog.findMany({
      take: limit,
      orderBy: { reportedAt: 'desc' },
    });
  }

  private async handleHighSeverityBreach(breachId: string, breach: DataBreachReport) {
    // Log critical breach
    this.logger.error(`CRITICAL BREACH DETECTED: ${breach.description}`);

    // In a real implementation, you would:
    // 1. Send immediate notifications to security team
    // 2. Trigger automated security responses
    // 3. Prepare regulatory notifications (within 72 hours for GDPR)
    // 4. Begin user notification process if required

    const actions = {
      securityTeamNotified: new Date(),
      automaticResponseTriggered: true,
      regulatoryNotificationRequired: breach.severity === 'critical',
      userNotificationRequired: breach.affectedUsers && breach.affectedUsers > 0,
    };

    await this.updateBreachStatus(breachId, 'investigating', actions);
  }

  async generateBreachReport(startDate: Date, endDate: Date) {
    const breaches = await this.prisma.dataBreachLog.findMany({
      where: {
        reportedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { reportedAt: 'desc' },
    });

    const summary = {
      totalBreaches: breaches.length,
      bySeverity: {
        critical: breaches.filter(b => b.severity === 'critical').length,
        high: breaches.filter(b => b.severity === 'high').length,
        medium: breaches.filter(b => b.severity === 'medium').length,
        low: breaches.filter(b => b.severity === 'low').length,
      },
      totalAffectedUsers: breaches.reduce((sum, b) => sum + b.affectedUsers, 0),
      resolvedBreaches: breaches.filter(b => b.status === 'resolved').length,
      averageResolutionTime: this.calculateAverageResolutionTime(breaches),
    };

    return {
      summary,
      breaches,
      generatedAt: new Date(),
    };
  }

  private calculateAverageResolutionTime(breaches: any[]): number {
    const resolvedBreaches = breaches.filter(b => b.resolvedAt);
    if (resolvedBreaches.length === 0) return 0;

    const totalTime = resolvedBreaches.reduce((sum, breach) => {
      const resolutionTime = new Date(breach.resolvedAt).getTime() - new Date(breach.reportedAt).getTime();
      return sum + resolutionTime;
    }, 0);

    return Math.round(totalTime / resolvedBreaches.length / (1000 * 60 * 60)); // Hours
  }
}
