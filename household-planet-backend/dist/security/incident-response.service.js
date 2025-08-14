"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentResponseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sentry_monitoring_service_1 = require("./sentry-monitoring.service");
let IncidentResponseService = class IncidentResponseService {
    constructor(prisma, sentryService) {
        this.prisma = prisma;
        this.sentryService = sentryService;
    }
    async reportSecurityIncident(incidentData) {
        const incident = await this.prisma.securityIncident.create({
            data: {
                type: incidentData.type,
                severity: this.calculateSeverity(incidentData),
                description: incidentData.description,
                status: 'OPEN',
            },
        });
        await this.initiateResponse(incident);
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
    async updateIncidentStatus(incidentId, status, notes) {
        const updateData = {
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
    async getSecurityAuditLog(startDate, endDate) {
        const whereClause = {};
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate)
                whereClause.createdAt.gte = startDate;
            if (endDate)
                whereClause.createdAt.lte = endDate;
        }
        return this.prisma.securityIncident.findMany({
            where: whereClause,
            orderBy: { reportedAt: 'desc' },
        });
    }
    async generateSecurityReport(period) {
        const now = new Date();
        let startDate;
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
    async initiateResponse(incident) {
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
    async handleCriticalIncident(incident) {
        console.log(`CRITICAL INCIDENT: ${incident.id} - Initiating emergency response`);
        await this.notifyStakeholders(incident, 'CRITICAL');
        await this.implementContainment(incident);
    }
    async handleHighSeverityIncident(incident) {
        console.log(`HIGH SEVERITY INCIDENT: ${incident.id} - Initiating response`);
        await this.notifyStakeholders(incident, 'HIGH');
    }
    async handleMediumSeverityIncident(incident) {
        console.log(`MEDIUM SEVERITY INCIDENT: ${incident.id} - Logging for review`);
        await this.notifyStakeholders(incident, 'MEDIUM');
    }
    async handleLowSeverityIncident(incident) {
        console.log(`LOW SEVERITY INCIDENT: ${incident.id} - Logged for monitoring`);
    }
    calculateSeverity(incidentData) {
        const criticalTypes = ['DATA_BREACH', 'SYSTEM_COMPROMISE', 'RANSOMWARE'];
        const highTypes = ['UNAUTHORIZED_ACCESS', 'DDoS_ATTACK', 'MALWARE'];
        if (criticalTypes.includes(incidentData.type))
            return 'CRITICAL';
        if (highTypes.includes(incidentData.type))
            return 'HIGH';
        if (incidentData.affectedSystems?.length > 3)
            return 'HIGH';
        return 'MEDIUM';
    }
    async notifyStakeholders(incident, severity) {
        console.log(`Notifying stakeholders for ${severity} incident: ${incident.id}`);
    }
    async implementContainment(incident) {
        console.log(`Implementing containment for incident: ${incident.id}`);
    }
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'Unknown';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }
    calculateAverageResolutionTime(incidents) {
        const resolved = incidents.filter(i => i.resolvedAt);
        if (resolved.length === 0)
            return 0;
        const totalTime = resolved.reduce((sum, incident) => {
            return sum + (incident.resolvedAt.getTime() - incident.detectedAt.getTime());
        }, 0);
        return Math.round(totalTime / resolved.length / (1000 * 60 * 60));
    }
    analyzeTrends(incidents) {
        return {
            increasingTypes: ['PHISHING_ATTEMPT'],
            decreasingTypes: ['BRUTE_FORCE'],
            recommendations: [
                'Increase phishing awareness training',
                'Continue current brute force protection measures',
            ],
        };
    }
};
exports.IncidentResponseService = IncidentResponseService;
exports.IncidentResponseService = IncidentResponseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sentry_monitoring_service_1.SentryMonitoringService])
], IncidentResponseService);
//# sourceMappingURL=incident-response.service.js.map