import { PrismaService } from '../prisma/prisma.service';
export declare class SecurityMonitoringService {
    private prisma;
    constructor(prisma: PrismaService);
    detectThreat(request: any): Promise<{
        threat: boolean;
        type?: string;
        severity?: string;
    }>;
    monitorFailedLogin(email: string, ip: string): Promise<boolean>;
    logSecurityEvent(event: string, details: any, userId?: string): Promise<void>;
    private sendSecurityAlert;
    private checkRateLimit;
    private detectSQLInjection;
    private detectXSS;
    private detectSuspiciousUserAgent;
    private getEventSeverity;
    generateSecurityReport(days?: number): Promise<any>;
    private getTopEvents;
    private getTopIPs;
    private generateRecommendations;
}
