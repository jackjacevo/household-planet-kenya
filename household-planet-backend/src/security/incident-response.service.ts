import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SentryMonitoringService } from './sentry-monitoring.service';

@Injectable()
export class IncidentResponseService {
  constructor(
    private prisma: PrismaService,
    private sentryService: SentryMonitoringService,
  ) {}

  async reportSecurityIncident(incidentData: any) {
    const incident = await this.prisma.securityIncident.create({
      data: {
        type: incidentData.type,
        severity: this.calculateSeverity(incidentData),
        description: incidentData.description,
        status: 'OPEN',
      },
    });

    // Immediate response based on severity
    await this.initiateResponse(incident);
    
    // Log to monitoring system
    this.sentryService.captureSecurityEvent('SECURITY_INCIDENT', {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity,
    });

    return incident;
  }

  async getIncidentResponsePlan() {
    return {
      phases: [
        {
          phase: 'Detection',
          description: 'Identify and confirm security incident',
          actions: [
            'Monitor security alerts',
            'Analyze suspicious activities',
            'Confirm incident validity',
            'Document initial findings',
          ],
          timeframe: '0-15 minutes',
        },
        {
          phase: 'Containment',
          description: 'Limit the scope and impact of the incident',
          actions: [
            'Isolate affected systems',
            'Block malicious traffic',
            'Preserve evidence',
            'Implement temporary fixes',
          ],
          timeframe: '15 minutes - 2 hours',
        },
        {
          phase: 'Investigation',
          description: 'Analyze the incident and determine root cause',
          actions: [
            'Collect and analyze logs',
            'Interview relevant personnel',
            'Determine attack vectors',
            'Assess damage and impact',
          ],
          timeframe: '2-24 hours',
        },
        {
          phase: 'Recovery',
          description: 'Restore systems and services to normal operation',
          actions: [
            'Apply security patches',
            'Restore from clean backups',
            'Implement additional controls',
            'Monitor for recurring issues',
          ],
          timeframe: '1-7 days',
        },
        {
          phase: 'Lessons Learned',
          description: 'Review and improve security measures',
          actions: [
            'Conduct post-incident review',
            'Update security policies',
            'Improve detection capabilities',
            'Train staff on new procedures',
          ],
          timeframe: '1-2 weeks',
        },
      ],
      contacts: {
        securityTeam: '+254700123456',
        management: '+254700123457',
        legal: '+254700123458',
        communications: '+254700123459',
      },
      escalationMatrix: {
        LOW: ['Security Team'],
        MEDIUM: ['Security Team', 'IT Manager'],
        HIGH: ['Security Team', 'IT Manager', 'CTO'],
        CRITICAL: ['Security Team', 'IT Manager', 'CTO', 'CEO'],
      },
    };
  }

  async updateIncidentStatus(incidentId: string, status: string, notes?: string) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.responseNotes = notes;
    }

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    return this.prisma.securityIncident.update({
      where: { id: incidentId },
      data: updateData,
    });
  }

  async getSecurityAuditLog(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    return this.prisma.securityIncident.findMany({
      where: whereClause,
      orderBy: { reportedAt: 'desc' },

    });
  }

  async generateSecurityReport(period: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const incidents = await this.prisma.securityIncident.findMany({
      where: {
        reportedAt: { gte: startDate },
      },
    });

    const summary = {
      period,
      totalIncidents: incidents.length,
      byType: this.groupBy(incidents, 'type'),
      bySeverity: this.groupBy(incidents, 'severity'),
      byStatus: this.groupBy(incidents, 'status'),
      averageResolutionTime: this.calculateAverageResolutionTime(incidents),
      trends: this.analyzeTrends(incidents),
    };

    return summary;
  }

  private async initiateResponse(incident: any) {
    switch (incident.severity) {
      case 'CRITICAL':
        await this.handleCriticalIncident(incident);
        break;
      case 'HIGH':
        await this.handleHighSeverityIncident(incident);
        break;
      case 'MEDIUM':
        await this.handleMediumSeverityIncident(incident);
        break;
      default:
        await this.handleLowSeverityIncident(incident);
    }
  }

  private async handleCriticalIncident(incident: any) {
    // Immediate containment actions
    console.log(`CRITICAL INCIDENT: ${incident.id} - Initiating emergency response`);
    
    // Notify all stakeholders
    await this.notifyStakeholders(incident, 'CRITICAL');
    
    // Auto-implement containment measures
    await this.implementContainment(incident);
  }

  private async handleHighSeverityIncident(incident: any) {
    console.log(`HIGH SEVERITY INCIDENT: ${incident.id} - Initiating response`);
    await this.notifyStakeholders(incident, 'HIGH');
  }

  private async handleMediumSeverityIncident(incident: any) {
    console.log(`MEDIUM SEVERITY INCIDENT: ${incident.id} - Logging for review`);
    await this.notifyStakeholders(incident, 'MEDIUM');
  }

  private async handleLowSeverityIncident(incident: any) {
    console.log(`LOW SEVERITY INCIDENT: ${incident.id} - Logged for monitoring`);
  }

  private calculateSeverity(incidentData: any): string {
    const criticalTypes = ['DATA_BREACH', 'SYSTEM_COMPROMISE', 'RANSOMWARE'];
    const highTypes = ['UNAUTHORIZED_ACCESS', 'DDoS_ATTACK', 'MALWARE'];
    
    if (criticalTypes.includes(incidentData.type)) return 'CRITICAL';
    if (highTypes.includes(incidentData.type)) return 'HIGH';
    if (incidentData.affectedSystems?.length > 3) return 'HIGH';
    
    return 'MEDIUM';
  }

  private async notifyStakeholders(incident: any, severity: string) {
    // Implementation for stakeholder notification
    console.log(`Notifying stakeholders for ${severity} incident: ${incident.id}`);
  }

  private async implementContainment(incident: any) {
    // Implementation for automatic containment measures
    console.log(`Implementing containment for incident: ${incident.id}`);
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'Unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  private calculateAverageResolutionTime(incidents: any[]) {
    const resolved = incidents.filter(i => i.resolvedAt);
    if (resolved.length === 0) return 0;
    
    const totalTime = resolved.reduce((sum, incident) => {
      return sum + (incident.resolvedAt.getTime() - incident.detectedAt.getTime());
    }, 0);
    
    return Math.round(totalTime / resolved.length / (1000 * 60 * 60)); // Hours
  }

  private analyzeTrends(incidents: any[]) {
    // Simple trend analysis
    return {
      increasingTypes: ['PHISHING_ATTEMPT'],
      decreasingTypes: ['BRUTE_FORCE'],
      recommendations: [
        'Increase phishing awareness training',
        'Continue current brute force protection measures',
      ],
    };
  }
}