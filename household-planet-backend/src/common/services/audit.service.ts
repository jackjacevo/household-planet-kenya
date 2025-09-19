import { Injectable, Logger } from '@nestjs/common';

export interface AuditLog {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  async log(auditLog: AuditLog): Promise<void> {
    // Log to console/file
    this.logger.log(`AUDIT: ${auditLog.action} on ${auditLog.resource}`, {
      userId: auditLog.userId,
      resourceId: auditLog.resourceId,
      ip: auditLog.ip,
      userAgent: auditLog.userAgent,
      timestamp: auditLog.timestamp,
      details: auditLog.details
    });

    // In production, you would store this in a secure audit database
    // await this.auditRepository.create(auditLog);
  }

  async logSecurityEvent(event: string, details: any, ip: string, userAgent: string): Promise<void> {
    await this.log({
      action: 'SECURITY_EVENT',
      resource: event,
      ip,
      userAgent,
      timestamp: new Date(),
      details
    });
  }

  async logDataAccess(userId: string, resource: string, resourceId: string, ip: string, userAgent: string): Promise<void> {
    await this.log({
      userId,
      action: 'DATA_ACCESS',
      resource,
      resourceId,
      ip,
      userAgent,
      timestamp: new Date()
    });
  }

  async logDataModification(userId: string, action: string, resource: string, resourceId: string, changes: any, ip: string, userAgent: string): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      ip,
      userAgent,
      timestamp: new Date(),
      details: { changes }
    });
  }
}
