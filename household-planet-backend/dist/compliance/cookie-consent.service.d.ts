import { PrismaService } from '../prisma/prisma.service';
export declare class CookieConsentService {
    private prisma;
    constructor(prisma: PrismaService);
    recordCookieConsent(sessionId: string, consents: any, ipAddress: string): Promise<{
        id: string;
        sessionId: string;
        analytics: boolean;
        timestamp: Date;
        necessary: boolean;
        marketing: boolean;
        preferences: boolean;
    }>;
    getCookieConsent(sessionId: string): Promise<{
        id: string;
        sessionId: string;
        analytics: boolean;
        timestamp: Date;
        necessary: boolean;
        marketing: boolean;
        preferences: boolean;
    }>;
    updateCookieConsent(sessionId: string, consents: any): Promise<{
        id: string;
        sessionId: string;
        analytics: boolean;
        timestamp: Date;
        necessary: boolean;
        marketing: boolean;
        preferences: boolean;
    }>;
    getCookiePolicy(): {
        necessary: {
            name: string;
            description: string;
            required: boolean;
            cookies: string[];
        };
        analytics: {
            name: string;
            description: string;
            required: boolean;
            cookies: string[];
        };
        marketing: {
            name: string;
            description: string;
            required: boolean;
            cookies: string[];
        };
        preferences: {
            name: string;
            description: string;
            required: boolean;
            cookies: string[];
        };
    };
}
