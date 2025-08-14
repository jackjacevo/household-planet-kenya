import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAuditEvent(action: string, details?: any, userId?: string, ipAddress?: string): Promise<void>;
    performSecurityAudit(): Promise<any>;
    private auditPasswordPolicies;
    private auditSessionSecurity;
    private auditDataEncryption;
    private auditAccessControls;
    private auditSecurityHeaders;
    private auditRateLimiting;
    generateComplianceReport(): Promise<any>;
    private calculateComplianceScore;
    private getTopActions;
    private generateComplianceRecommendations;
    private generateSessionId;
    cleanupOldAuditLogs(retentionDays?: number): Promise<void>;
}
