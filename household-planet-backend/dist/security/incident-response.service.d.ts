import { PrismaService } from '../prisma/prisma.service';
import { SentryMonitoringService } from './sentry-monitoring.service';
export declare class IncidentResponseService {
    private prisma;
    private sentryService;
    constructor(prisma: PrismaService, sentryService: SentryMonitoringService);
    reportSecurityIncident(incidentData: any): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        type: string;
        status: string;
        severity: string;
        reportedAt: Date;
        resolvedAt: Date | null;
    }>;
    getIncidentResponsePlan(): Promise<{
        phases: {
            phase: string;
            description: string;
            actions: string[];
            timeframe: string;
        }[];
        contacts: {
            securityTeam: string;
            management: string;
            legal: string;
            communications: string;
        };
        escalationMatrix: {
            LOW: string[];
            MEDIUM: string[];
            HIGH: string[];
            CRITICAL: string[];
        };
    }>;
    updateIncidentStatus(incidentId: string, status: string, notes?: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        type: string;
        status: string;
        severity: string;
        reportedAt: Date;
        resolvedAt: Date | null;
    }>;
    getSecurityAuditLog(startDate?: Date, endDate?: Date): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        type: string;
        status: string;
        severity: string;
        reportedAt: Date;
        resolvedAt: Date | null;
    }[]>;
    generateSecurityReport(period: 'daily' | 'weekly' | 'monthly'): Promise<{
        period: "daily" | "weekly" | "monthly";
        totalIncidents: number;
        byType: any;
        bySeverity: any;
        byStatus: any;
        averageResolutionTime: number;
        trends: {
            increasingTypes: string[];
            decreasingTypes: string[];
            recommendations: string[];
        };
    }>;
    private initiateResponse;
    private handleCriticalIncident;
    private handleHighSeverityIncident;
    private handleMediumSeverityIncident;
    private handleLowSeverityIncident;
    private calculateSeverity;
    private notifyStakeholders;
    private implementContainment;
    private groupBy;
    private calculateAverageResolutionTime;
    private analyzeTrends;
}
