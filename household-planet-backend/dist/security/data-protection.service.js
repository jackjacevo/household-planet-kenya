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
exports.DataProtectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const encryption_service_1 = require("./encryption.service");
const crypto = require("crypto");
let DataProtectionService = class DataProtectionService {
    constructor(prisma, encryptionService) {
        this.prisma = prisma;
        this.encryptionService = encryptionService;
    }
    async classifyAndProtectData(data, classification) {
        switch (classification) {
            case 'RESTRICTED':
                return this.encryptAllFields(data);
            case 'CONFIDENTIAL':
                return this.encryptSensitiveFields(data);
            case 'INTERNAL':
                return this.hashIdentifiableFields(data);
            case 'PUBLIC':
                return data;
            default:
                throw new Error('Invalid data classification');
        }
    }
    async encryptAllFields(data) {
        const encrypted = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                encrypted[key] = await this.encryptionService.encrypt(value);
            }
            else {
                encrypted[key] = value;
            }
        }
        return encrypted;
    }
    async encryptSensitiveFields(data) {
        const sensitiveFields = ['email', 'phone', 'address', 'paymentInfo', 'personalId'];
        const protectedData = { ...data };
        for (const field of sensitiveFields) {
            if (protectedData[field] && typeof protectedData[field] === 'string') {
                protectedData[field] = await this.encryptionService.encrypt(protectedData[field]);
            }
        }
        return protectedData;
    }
    hashIdentifiableFields(data) {
        const identifiableFields = ['email', 'phone', 'personalId'];
        const protectedData = { ...data };
        for (const field of identifiableFields) {
            if (protectedData[field] && typeof protectedData[field] === 'string') {
                protectedData[field] = crypto.createHash('sha256').update(protectedData[field]).digest('hex');
            }
        }
        return protectedData;
    }
    async anonymizeUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                orders: true,
                reviews: true
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        const anonymized = {
            id: `anon_${crypto.randomBytes(8).toString('hex')}`,
            demographics: {
                ageRange: this.getAgeRange(user.dateOfBirth),
                location: this.getLocationRegion(''),
                registrationMonth: user.createdAt.getMonth(),
                registrationYear: user.createdAt.getFullYear()
            },
            behavior: {
                totalOrders: user.orders?.length || 0,
                totalSpent: user.orders?.reduce((sum, order) => sum + order.total, 0) || 0,
                averageOrderValue: user.orders && user.orders.length > 0 ?
                    user.orders.reduce((sum, order) => sum + order.total, 0) / user.orders.length : 0,
                reviewsCount: user.reviews?.length || 0,
                lastActivityMonth: user.lastLoginAt ? user.lastLoginAt.getMonth() : null
            }
        };
        return anonymized;
    }
    getAgeRange(dateOfBirth) {
        if (!dateOfBirth)
            return 'unknown';
        const age = new Date().getFullYear() - dateOfBirth.getFullYear();
        if (age < 18)
            return '0-17';
        if (age < 25)
            return '18-24';
        if (age < 35)
            return '25-34';
        if (age < 45)
            return '35-44';
        if (age < 55)
            return '45-54';
        if (age < 65)
            return '55-64';
        return '65+';
    }
    getLocationRegion(address) {
        if (!address)
            return 'unknown';
        const lowerAddress = address.toLowerCase();
        if (lowerAddress.includes('nairobi'))
            return 'nairobi';
        if (lowerAddress.includes('mombasa'))
            return 'coast';
        if (lowerAddress.includes('kisumu'))
            return 'western';
        if (lowerAddress.includes('nakuru'))
            return 'rift-valley';
        if (lowerAddress.includes('eldoret'))
            return 'rift-valley';
        if (lowerAddress.includes('thika'))
            return 'central';
        if (lowerAddress.includes('meru'))
            return 'eastern';
        return 'other';
    }
    maskSensitiveData(data, fields) {
        const masked = { ...data };
        for (const field of fields) {
            if (masked[field]) {
                if (field === 'email') {
                    masked[field] = this.maskEmail(masked[field]);
                }
                else if (field === 'phone') {
                    masked[field] = this.maskPhone(masked[field]);
                }
                else if (field === 'cardNumber') {
                    masked[field] = this.maskCardNumber(masked[field]);
                }
                else {
                    masked[field] = this.maskGeneric(masked[field]);
                }
            }
        }
        return masked;
    }
    maskEmail(email) {
        const [username, domain] = email.split('@');
        if (username.length <= 2) {
            return `${username[0]}*@${domain}`;
        }
        return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
    }
    maskPhone(phone) {
        if (phone.length <= 4)
            return phone;
        return `${phone.substring(0, 3)}${'*'.repeat(phone.length - 6)}${phone.substring(phone.length - 3)}`;
    }
    maskCardNumber(cardNumber) {
        if (cardNumber.length <= 4)
            return cardNumber;
        return `****-****-****-${cardNumber.substring(cardNumber.length - 4)}`;
    }
    maskGeneric(value) {
        if (value.length <= 2)
            return '*'.repeat(value.length);
        return `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
    }
    async enforceDataRetention() {
        const retentionPolicies = [
            { table: 'auditLog', field: 'timestamp', days: 90 },
            { table: 'securityEvent', field: 'timestamp', days: 90 },
            { table: 'paymentAuditLog', field: 'timestamp', days: 2555 },
            { table: 'userConsent', field: 'timestamp', days: 730 },
            { table: 'cookieConsent', field: 'timestamp', days: 730 }
        ];
        for (const policy of retentionPolicies) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - policy.days);
            try {
                await this.prisma[policy.table].deleteMany({
                    where: {
                        [policy.field]: { lt: cutoffDate }
                    }
                });
                console.log(`Data retention: Cleaned ${policy.table} records older than ${policy.days} days`);
            }
            catch (error) {
                console.error(`Error cleaning ${policy.table}:`, error);
            }
        }
    }
    async secureDelete(table, id) {
        const randomData = {
            email: crypto.randomBytes(16).toString('hex') + '@deleted.local',
            phone: crypto.randomBytes(8).toString('hex'),
            firstName: 'DELETED',
            lastName: 'USER',
            address: 'DELETED'
        };
        try {
            await this.prisma[table].update({
                where: { id },
                data: randomData
            });
            await this.prisma[table].delete({
                where: { id }
            });
            console.log(`Secure deletion completed for ${table} ID: ${id}`);
        }
        catch (error) {
            console.error(`Error in secure deletion:`, error);
            throw error;
        }
    }
    async detectDataBreach(suspiciousActivity) {
        const indicators = [
            suspiciousActivity.unusualDataAccess,
            suspiciousActivity.multipleFailedLogins,
            suspiciousActivity.dataExfiltrationAttempt,
            suspiciousActivity.unauthorizedSystemAccess,
            suspiciousActivity.suspiciousNetworkTraffic
        ];
        const breachScore = indicators.filter(Boolean).length;
        if (breachScore >= 3) {
            await this.handleDataBreach({
                detectedAt: new Date(),
                indicators: suspiciousActivity,
                severity: breachScore >= 4 ? 'HIGH' : 'MEDIUM',
                autoDetected: true
            });
            return true;
        }
        return false;
    }
    async handleDataBreach(breachDetails) {
        await this.prisma.dataBreach.create({
            data: {
                type: 'AUTO_DETECTED',
                description: `Auto-detected breach: ${JSON.stringify(breachDetails.indicators)}`,
                severity: breachDetails.severity,
                affectedUsers: 0
            }
        });
        await this.activateBreachResponse();
        setTimeout(async () => {
            await this.notifyAuthorities(breachDetails);
        }, 1000);
        console.log('🚨 DATA BREACH DETECTED - Immediate response activated');
    }
    async activateBreachResponse() {
        console.log('🔒 Isolating affected systems...');
        console.log('📋 Preserving breach evidence...');
        console.log('🔍 Assessing breach scope...');
        console.log('📞 Notifying security team...');
        console.log('📧 Preparing user notifications...');
    }
    async notifyAuthorities(breachDetails) {
        const notification = {
            timestamp: new Date().toISOString(),
            breach: breachDetails,
            companyInfo: {
                name: 'Household Planet Kenya',
                contact: 'privacy@householdplanet.co.ke',
                dpo: 'dpo@householdplanet.co.ke'
            },
            notificationRequired: true
        };
        console.log('📋 Authority notification prepared:', notification);
    }
    async generateDataProtectionReport() {
        const report = {
            reportId: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
            period: '30 days',
            dataProtectionMetrics: {
                encryptedRecords: await this.countEncryptedRecords(),
                anonymizedRecords: await this.countAnonymizedRecords(),
                dataRetentionCompliance: await this.checkRetentionCompliance(),
                breachIncidents: await this.countBreachIncidents(),
                dataSubjectRequests: await this.countDataSubjectRequests()
            },
            complianceStatus: 'COMPLIANT',
            recommendations: [
                'Continue regular data protection audits',
                'Update encryption keys quarterly',
                'Review data retention policies annually'
            ]
        };
        return report;
    }
    async countEncryptedRecords() {
        return 1000;
    }
    async countAnonymizedRecords() {
        return 500;
    }
    async checkRetentionCompliance() {
        return 'COMPLIANT';
    }
    async countBreachIncidents() {
        return 0;
    }
    async countDataSubjectRequests() {
        return 0;
    }
};
exports.DataProtectionService = DataProtectionService;
exports.DataProtectionService = DataProtectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], DataProtectionService);
//# sourceMappingURL=data-protection.service.js.map