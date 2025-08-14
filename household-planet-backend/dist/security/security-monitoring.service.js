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
exports.SecurityMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SecurityMonitoringService = class SecurityMonitoringService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async detectThreat(request) {
        const threats = [];
        if (this.detectSQLInjection(JSON.stringify(request.body))) {
            threats.push({ type: 'SQL_INJECTION', severity: 'HIGH' });
        }
        if (this.detectXSS(JSON.stringify(request.body))) {
            threats.push({ type: 'XSS_ATTEMPT', severity: 'HIGH' });
        }
        if (this.detectSuspiciousUserAgent(request.headers['user-agent'])) {
            threats.push({ type: 'SUSPICIOUS_USER_AGENT', severity: 'MEDIUM' });
        }
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
    async monitorFailedLogin(email, ip) {
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
            return true;
        }
        return false;
    }
    async logSecurityEvent(event, details, userId) {
        await this.prisma.securityEvent.create({
            data: {
                event,
                details: JSON.stringify(details),
                userId,
                severity: this.getEventSeverity(event),
                ipAddress: details.ip || '127.0.0.1'
            }
        });
        if (this.getEventSeverity(event) === 'HIGH') {
            await this.sendSecurityAlert(event, details);
        }
    }
    async sendSecurityAlert(event, details) {
        const alert = {
            timestamp: new Date().toISOString(),
            event,
            details,
            severity: 'HIGH',
            action: 'IMMEDIATE_ATTENTION_REQUIRED'
        };
        console.log('🚨 SECURITY ALERT:', JSON.stringify(alert, null, 2));
    }
    async checkRateLimit(ip) {
        const requests = await this.prisma.securityEvent.count({
            where: {
                ipAddress: ip
            }
        });
        return requests > 100;
    }
    detectSQLInjection(input) {
        const patterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /('|(')|(;)|(;)|(\|)|(\*)|(%)|(\<)|(\>)|(\^)|(\[)|(\])|(\{)|(\})|(\()|(\)))/g,
            /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i
        ];
        return patterns.some(pattern => pattern.test(input));
    }
    detectXSS(input) {
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
    detectSuspiciousUserAgent(userAgent) {
        if (!userAgent)
            return true;
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
    getEventSeverity(event) {
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
        if (highSeverityEvents.includes(event))
            return 'HIGH';
        if (mediumSeverityEvents.includes(event))
            return 'MEDIUM';
        return 'LOW';
    }
    async generateSecurityReport(days = 7) {
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
    getTopEvents(events) {
        const eventCounts = events.reduce((acc, event) => {
            acc[event.event] = (acc[event.event] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(eventCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([event, count]) => ({ event, count }));
    }
    getTopIPs(events) {
        const ipCounts = events.reduce((acc, event) => {
            acc[event.ipAddress] = (acc[event.ipAddress] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(ipCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([ip, count]) => ({ ip, count }));
    }
    generateRecommendations(events) {
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
};
exports.SecurityMonitoringService = SecurityMonitoringService;
exports.SecurityMonitoringService = SecurityMonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityMonitoringService);
//# sourceMappingURL=security-monitoring.service.js.map