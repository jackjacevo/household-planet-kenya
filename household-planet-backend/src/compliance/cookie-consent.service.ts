import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CookieConsentService {
  constructor(private prisma: PrismaService) {}

  async recordCookieConsent(sessionId: string, consents: any, ipAddress: string) {
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

  async getCookieConsent(sessionId: string) {
    return this.prisma.cookieConsent.findFirst({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async updateCookieConsent(sessionId: string, consents: any) {
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
}