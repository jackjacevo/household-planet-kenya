import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SecurityMonitoringService {
  constructor(private prisma: PrismaService) {}

  // Real-time threat detection
  async detectThreat(request: any): Promise<{ threat: boolean; type?: string; severity?: string }> {
    const threats = [];

    // Check for SQL injection patterns
    if (this.detectSQLInjection(JSON.stringify(request.body))) {
      threats.push({ type: 'SQL_INJECTION', severity: 'HIGH' });
    }

    // Check for XSS patterns
    if (this.detectXSS(JSON.stringify(request.body))) {
      threats.push({ type: 'XSS_ATTEMPT', severity: 'HIGH' });
    }

    // Check for suspicious user agents
    if (this.detectSuspiciousUserAgent(request.headers['user-agent'])) {
      threats.push({ type: 'SUSPICIOUS_USER_AGENT', severity: 'MEDIUM' });
    }

    // Check for rate limit violations
    if (await this.checkRateLimit(request.ip)) {
      threats.push({ type: 'RATE_LIMIT_VIOLATION', severity: 'MEDIUM' });
    }

    if (threats.length > 0) {
      await this.logSecurityEvent('THREAT_DETECTED', {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        threats,
        url: request.url,
        method: request.method
      });

      return { threat: true, type: threats[0].type, severity: threats[0].severity };
    }

    return { threat: false };
  }

  // Monitor failed login attempts
  async monitorFailedLogin(email: string, ip: string): Promise<boolean> {
    const attempts = await this.prisma.securityEvent.count({
      where: {
        event: 'FAILED_LOGIN',
        details: { contains: email }
      }
    });

    if (attempts >= 5) {
      await this.logSecurityEvent('ACCOUNT_LOCKOUT', {
        email,
        ip,
        attempts,
        lockoutDuration: '15 minutes'
      });
      return true; // Account should be locked
    }

    return false;
  }

  // Log security events
  async logSecurityEvent(event: string, details: any, userId?: string): Promise<void> {
    await this.prisma.securityEvent.create({
      data: {
        event,
        details: JSON.stringify(details),
        userId,
        severity: this.getEventSeverity(event),
        ipAddress: details.ip || '127.0.0.1'
      }
    });

    // Send alert for high severity events
    if (this.getEventSeverity(event) === 'HIGH') {
      await this.sendSecurityAlert(event, details);
    }
  }

  // Generate security alerts
  private async sendSecurityAlert(event: string, details: any): Promise<void> {
    const alert = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: 'HIGH',
      action: 'IMMEDIATE_ATTENTION_REQUIRED'
    };

    console.log('🚨 SECURITY ALERT:', JSON.stringify(alert, null, 2));
    
    // In production, send to security team via email/Slack/SMS
    // await this.emailService.sendSecurityAlert(alert);
    // await this.slackService.sendAlert(alert);
  }

  // Check rate limits
  private async checkRateLimit(ip: string): Promise<boolean> {
    const requests = await this.prisma.securityEvent.count({
      where: {
        ipAddress: ip
      }
    });

    return requests > 100; // More than 100 requests per minute
  }

  // Detect SQL injection patterns
  private detectSQLInjection(input: string): boolean {
    const patterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /('|(')|(;)|(;)|(\|)|(\*)|(%)|(\<)|(\>)|(\^)|(\[)|(\])|(\{)|(\})|(\()|(\)))/g,
      /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i
    ];
    
    return patterns.some(pattern => pattern.test(input));
  }

  // Detect XSS patterns
  private detectXSS(input: string): boolean {
    const patterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return patterns.some(pattern => pattern.test(input));
  }

  // Detect suspicious user agents
  private detectSuspiciousUserAgent(userAgent: string): boolean {
    if (!userAgent) return true;

    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Get event severity
  private getEventSeverity(event: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highSeverityEvents = [
      'SQL_INJECTION_ATTEMPT',
      'XSS_ATTEMPT',
      'BRUTE_FORCE_ATTACK',
      'DATA_BREACH',
      'UNAUTHORIZED_ACCESS'
    ];
    
    const mediumSeverityEvents = [
      'FAILED_LOGIN',
      'ACCOUNT_LOCKOUT',
      'RATE_LIMIT_VIOLATION',
      'SUSPICIOUS_USER_AGENT',
      'INVALID_TOKEN'
    ];

    if (highSeverityEvents.includes(event)) return 'HIGH';
    if (mediumSeverityEvents.includes(event)) return 'MEDIUM';
    return 'LOW';
  }

  // Generate security report
  async generateSecurityReport(days: number = 7): Promise<any> {
    const events = await this.prisma.securityEvent.findMany({
      orderBy: { id: 'desc' }
    });

    const summary = {
      period: `${days} days`,
      totalEvents: events.length,
      highSeverityEvents: events.filter(e => e.severity === 'HIGH').length,
      mediumSeverityEvents: events.filter(e => e.severity === 'MEDIUM').length,
      lowSeverityEvents: events.filter(e => e.severity === 'LOW').length,
      topEvents: this.getTopEvents(events),
      topIPs: this.getTopIPs(events),
      recommendations: this.generateRecommendations(events)
    };

    return summary;
  }

  private getTopEvents(events: any[]): any[] {
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([event, count]) => ({ event, count }));
  }

  private getTopIPs(events: any[]): any[] {
    const ipCounts = events.reduce((acc, event) => {
      acc[event.ipAddress] = (acc[event.ipAddress] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));
  }

  private generateRecommendations(events: any[]): string[] {
    const recommendations = [];
    
    const highSeverityCount = events.filter(e => e.severity === 'HIGH').length;
    if (highSeverityCount > 10) {
      recommendations.push('Consider implementing additional WAF rules');
    }

    const failedLogins = events.filter(e => e.event === 'FAILED_LOGIN').length;
    if (failedLogins > 50) {
      recommendations.push('Review account lockout policies');
    }

    const rateLimitViolations = events.filter(e => e.event === 'RATE_LIMIT_VIOLATION').length;
    if (rateLimitViolations > 20) {
      recommendations.push('Consider stricter rate limiting');
    }

    return recommendations;
  }
}