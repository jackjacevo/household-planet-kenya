import { Injectable, Logger } from '@nestjs/common';

interface ComplianceEvent {
  timestamp: Date;
  eventType: string;
  userId?: string;
  ipAddress?: string;
  details: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private complianceLog: ComplianceEvent[] = [];

  logPaymentEvent(eventType: string, details: any, userId?: string, ipAddress?: string): void {
    const event: ComplianceEvent = {
      timestamp: new Date(),
      eventType,
      userId,
      ipAddress,
      details: this.sanitizeDetails(details),
      riskLevel: this.assessRiskLevel(eventType, details),
    };

    this.complianceLog.push(event);
    this.logger.log(`PCI Compliance Event: ${eventType}`, { 
      userId, 
      riskLevel: event.riskLevel,
      timestamp: event.timestamp 
    });

    // Alert on high-risk events
    if (event.riskLevel === 'HIGH') {
      this.alertSecurityTeam(event);
    }
  }

  private sanitizeDetails(details: any): any {
    // Remove any potential sensitive data from logs
    const sanitized = { ...details };
    delete sanitized.cardNumber;
    delete sanitized.cvv;
    delete sanitized.pin;
    return sanitized;
  }

  private assessRiskLevel(eventType: string, details: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highRiskEvents = ['payment_failure', 'token_validation_failed', 'suspicious_activity'];
    const mediumRiskEvents = ['payment_retry', 'token_expired'];
    
    if (highRiskEvents.includes(eventType)) return 'HIGH';
    if (mediumRiskEvents.includes(eventType)) return 'MEDIUM';
    return 'LOW';
  }

  private alertSecurityTeam(event: ComplianceEvent): void {
    this.logger.warn(`HIGH RISK PAYMENT EVENT DETECTED`, event);
    // In production: send to security monitoring system
  }

  generateComplianceReport(): any {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.complianceLog.filter(e => e.timestamp > last24Hours);
    
    return {
      totalEvents: recentEvents.length,
      riskDistribution: {
        high: recentEvents.filter(e => e.riskLevel === 'HIGH').length,
        medium: recentEvents.filter(e => e.riskLevel === 'MEDIUM').length,
        low: recentEvents.filter(e => e.riskLevel === 'LOW').length,
      },
      complianceStatus: 'COMPLIANT',
      lastAssessment: new Date(),
    };
  }
}