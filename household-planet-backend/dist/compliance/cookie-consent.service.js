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
exports.CookieConsentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CookieConsentService = class CookieConsentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordCookieConsent(sessionId, consents, ipAddress) {
        return this.prisma.cookieConsent.create({
            data: {
                sessionId,
                necessary: consents.necessary || true,
                analytics: consents.analytics || false,
                marketing: consents.marketing || false,
                preferences: consents.preferences || false,
                timestamp: new Date(),
            },
        });
    }
    async getCookieConsent(sessionId) {
        return this.prisma.cookieConsent.findFirst({
            where: { sessionId },
            orderBy: { timestamp: 'desc' },
        });
    }
    async updateCookieConsent(sessionId, consents) {
        const existing = await this.getCookieConsent(sessionId);
        if (existing) {
            return this.prisma.cookieConsent.update({
                where: { id: existing.id },
                data: {
                    necessary: consents.necessary,
                    analytics: consents.analytics,
                    marketing: consents.marketing,
                    preferences: consents.preferences,
                    timestamp: new Date(),
                },
            });
        }
        return this.recordCookieConsent(sessionId, consents, '127.0.0.1');
    }
    getCookiePolicy() {
        return {
            necessary: {
                name: 'Necessary Cookies',
                description: 'Essential for website functionality and security',
                required: true,
                cookies: ['session', 'csrf_token', 'auth_token'],
            },
            analytics: {
                name: 'Analytics Cookies',
                description: 'Help us understand how visitors use our website',
                required: false,
                cookies: ['_ga', '_gid', 'analytics_session'],
            },
            marketing: {
                name: 'Marketing Cookies',
                description: 'Used to deliver personalized advertisements',
                required: false,
                cookies: ['marketing_id', 'ad_preferences'],
            },
            preferences: {
                name: 'Preference Cookies',
                description: 'Remember your settings and preferences',
                required: false,
                cookies: ['theme', 'language', 'currency'],
            },
        };
    }
};
exports.CookieConsentService = CookieConsentService;
exports.CookieConsentService = CookieConsentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CookieConsentService);
//# sourceMappingURL=cookie-consent.service.js.map