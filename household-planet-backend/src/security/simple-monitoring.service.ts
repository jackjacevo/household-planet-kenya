import { Injectable } from '@nestjs/common';

@Injectable()
export class SimpleMonitoringService {
  // Simple security event logging
  logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getEventSeverity(event)
    };
    
    console.log('🔒 SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
  }

  // Simple threat detection
  detectThreat(input: string): boolean {
    const threats = [
      /select.*from/i,
      /<script/i,
      /javascript:/i,
      /on\w+=/i
    ];
    
    return threats.some(pattern => pattern.test(input));
  }

  private getEventSeverity(event: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highEvents = ['SQL_INJECTION', 'XSS_ATTEMPT', 'BRUTE_FORCE'];
    const mediumEvents = ['FAILED_LOGIN', 'RATE_LIMIT'];
    
    if (highEvents.includes(event)) return 'HIGH';
    if (mediumEvents.includes(event)) return 'MEDIUM';
    return 'LOW';
  }
}