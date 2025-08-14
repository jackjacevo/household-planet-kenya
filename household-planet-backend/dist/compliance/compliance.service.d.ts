import { PrismaService } from '../prisma/prisma.service';
export declare class ComplianceService {
    private prisma;
    constructor(prisma: PrismaService);
    recordConsent(userId: number, consentType: string, granted: boolean): Promise<{
        id: string;
        userId: string;
        type: string;
        timestamp: Date;
        granted: boolean;
        grantedAt: Date;
    }>;
    getUserConsents(userId: number): Promise<{
        id: string;
        userId: string;
        type: string;
        timestamp: Date;
        granted: boolean;
        grantedAt: Date;
    }[]>;
    updatePrivacySettings(userId: number, settings: any): Promise<{
        name: string;
        email: string;
        phone: string | null;
        password: string;
        role: string;
        dateOfBirth: Date | null;
        gender: string | null;
        id: string;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string | null;
        lastName: string | null;
        emailVerified: boolean;
        phoneVerified: boolean;
        emailVerifyToken: string | null;
        phoneVerifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        refreshToken: string | null;
        lastLoginAt: Date | null;
        socialProviders: string | null;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        loyaltyPoints: number;
        totalSpent: number;
        preferredLanguage: string;
        marketingEmails: boolean;
        smsNotifications: boolean;
        optedOutAt: Date | null;
        phoneNumber: string | null;
        privacySettings: string | null;
    }>;
    requestDataDeletion(userId: number, reason?: string): Promise<void>;
    private executeDataDeletion;
    logDataBreach(description: string, affectedUsers: number[]): Promise<{
        id: string;
        description: string;
        type: string;
        severity: string;
        affectedUsers: number;
        detectedAt: Date;
        reportedAt: Date;
        resolvedAt: Date | null;
    }>;
    private scheduleBreachNotification;
}
