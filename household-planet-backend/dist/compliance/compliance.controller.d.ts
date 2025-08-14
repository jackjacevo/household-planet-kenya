import { ComplianceService } from './compliance.service';
import { CookieConsentService } from './cookie-consent.service';
import { DataExportService } from './data-export.service';
import { DataRetentionService } from './data-retention.service';
import { AgeVerificationService } from './age-verification.service';
import { GeographicRestrictionsService } from './geographic-restrictions.service';
import { TaxComplianceService } from './tax-compliance.service';
import { ConsumerRightsService } from './consumer-rights.service';
import { DisputeResolutionService } from './dispute-resolution.service';
export declare class ComplianceController {
    private complianceService;
    private cookieConsentService;
    private dataExportService;
    private dataRetentionService;
    private ageVerificationService;
    private geographicRestrictionsService;
    private taxComplianceService;
    private consumerRightsService;
    private disputeResolutionService;
    constructor(complianceService: ComplianceService, cookieConsentService: CookieConsentService, dataExportService: DataExportService, dataRetentionService: DataRetentionService, ageVerificationService: AgeVerificationService, geographicRestrictionsService: GeographicRestrictionsService, taxComplianceService: TaxComplianceService, consumerRightsService: ConsumerRightsService, disputeResolutionService: DisputeResolutionService);
    recordCookieConsent(body: any, req: any): Promise<{
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
    recordConsent(body: any, req: any): Promise<{
        id: string;
        userId: string;
        type: string;
        timestamp: Date;
        granted: boolean;
        grantedAt: Date;
    }>;
    getUserConsents(req: any): Promise<{
        id: string;
        userId: string;
        type: string;
        timestamp: Date;
        granted: boolean;
        grantedAt: Date;
    }[]>;
    updatePrivacySettings(settings: any, req: any): Promise<{
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
    requestDataExport(req: any): Promise<{
        fileName: string;
        filePath: string;
        data: {
            personalData: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phone: string;
                dateOfBirth: Date;
                createdAt: Date;
                updatedAt: Date;
            };
            addresses: {
                phone: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                type: string;
                fullName: string;
                county: string;
                town: string;
                street: string;
                landmark: string | null;
                isDefault: boolean;
            }[];
            orders: {
                id: string;
                orderNumber: string;
                status: string;
                total: number;
                createdAt: Date;
                items: ({
                    product: {
                        name: string;
                        id: string;
                        slug: string;
                        sku: string;
                        description: string | null;
                        shortDescription: string | null;
                        price: number;
                        comparePrice: number | null;
                        weight: number | null;
                        dimensions: string | null;
                        images: string | null;
                        categoryId: string;
                        brandId: string | null;
                        isActive: boolean;
                        isFeatured: boolean;
                        seoTitle: string | null;
                        seoDescription: string | null;
                        metaDescription: string | null;
                        tags: string | null;
                        keywords: string | null;
                        stock: number;
                        lowStockThreshold: number;
                        trackInventory: boolean;
                        averageRating: number | null;
                        totalReviews: number;
                        viewCount: number;
                        searchKeywords: string | null;
                        relatedProducts: string | null;
                        ageRestricted: boolean;
                        minimumAge: number | null;
                        warrantyPeriod: string | null;
                        warrantyType: string | null;
                        warrantyTerms: string | null;
                        geographicRestrictions: string | null;
                        restrictedRegions: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    price: number;
                    productId: string;
                    variantId: string | null;
                    quantity: number;
                    orderId: string;
                    total: number;
                })[];
                payments: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    phoneNumber: string;
                    status: string;
                    orderId: string;
                    failureReason: string | null;
                    paymentMethod: string;
                    checkoutRequestId: string;
                    merchantRequestId: string | null;
                    amount: number;
                    mpesaReceiptNumber: string | null;
                    transactionDate: Date | null;
                }[];
            }[];
            cart: ({
                product: {
                    name: string;
                    id: string;
                    slug: string;
                    sku: string;
                    description: string | null;
                    shortDescription: string | null;
                    price: number;
                    comparePrice: number | null;
                    weight: number | null;
                    dimensions: string | null;
                    images: string | null;
                    categoryId: string;
                    brandId: string | null;
                    isActive: boolean;
                    isFeatured: boolean;
                    seoTitle: string | null;
                    seoDescription: string | null;
                    metaDescription: string | null;
                    tags: string | null;
                    keywords: string | null;
                    stock: number;
                    lowStockThreshold: number;
                    trackInventory: boolean;
                    averageRating: number | null;
                    totalReviews: number;
                    viewCount: number;
                    searchKeywords: string | null;
                    relatedProducts: string | null;
                    ageRestricted: boolean;
                    minimumAge: number | null;
                    warrantyPeriod: string | null;
                    warrantyType: string | null;
                    warrantyTerms: string | null;
                    geographicRestrictions: string | null;
                    restrictedRegions: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                productId: string;
                userId: string;
                variantId: string | null;
                quantity: number;
            })[];
            reviews: ({
                product: {
                    name: string;
                    id: string;
                    slug: string;
                    sku: string;
                    description: string | null;
                    shortDescription: string | null;
                    price: number;
                    comparePrice: number | null;
                    weight: number | null;
                    dimensions: string | null;
                    images: string | null;
                    categoryId: string;
                    brandId: string | null;
                    isActive: boolean;
                    isFeatured: boolean;
                    seoTitle: string | null;
                    seoDescription: string | null;
                    metaDescription: string | null;
                    tags: string | null;
                    keywords: string | null;
                    stock: number;
                    lowStockThreshold: number;
                    trackInventory: boolean;
                    averageRating: number | null;
                    totalReviews: number;
                    viewCount: number;
                    searchKeywords: string | null;
                    relatedProducts: string | null;
                    ageRestricted: boolean;
                    minimumAge: number | null;
                    warrantyPeriod: string | null;
                    warrantyType: string | null;
                    warrantyTerms: string | null;
                    geographicRestrictions: string | null;
                    restrictedRegions: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                images: string | null;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                userId: string;
                rating: number;
                title: string | null;
                comment: string | null;
                isVerified: boolean;
                isHelpful: number;
            })[];
            consents: {
                id: string;
                userId: string;
                type: string;
                timestamp: Date;
                granted: boolean;
                grantedAt: Date;
            }[];
            cookieConsents: {
                id: string;
                sessionId: string;
                analytics: boolean;
                timestamp: Date;
                necessary: boolean;
                marketing: boolean;
                preferences: boolean;
            }[];
        };
    }>;
    getExportHistory(req: any): Promise<{
        id: string;
        userId: string;
        status: string;
        completedAt: Date | null;
        requestedAt: Date;
        downloadUrl: string | null;
        fileName: string | null;
    }[]>;
    requestAccountDeletion(body: any, req: any): Promise<void>;
    getPrivacyPolicy(): {
        lastUpdated: string;
        sections: {
            dataCollection: string;
            dataUsage: string;
            dataSharing: string;
            dataRetention: string;
            yourRights: string;
            contact: string;
        };
    };
    getRetentionPolicy(): Promise<{
        userAccounts: {
            activeUsers: string;
            inactiveUsers: string;
            deletedAccounts: string;
        };
        orderData: {
            completedOrders: string;
            cancelledOrders: string;
        };
        logs: {
            auditLogs: string;
            securityLogs: string;
            accessLogs: string;
        };
        consents: {
            cookieConsents: string;
            marketingConsents: string;
        };
        sessions: {
            activeSessions: string;
            expiredSessions: string;
        };
    }>;
    verifyAge(body: any, req: any): Promise<{
        isVerified: boolean;
        age: number;
    }>;
    checkProductAgeRestriction(productId: string, req: any): Promise<{
        allowed: boolean;
        reason?: undefined;
    } | {
        allowed: boolean;
        reason: string;
    }>;
    checkGeographicRestriction(productId: string, county: string, subcounty?: string): Promise<{
        allowed: boolean;
        reason: string;
    } | {
        allowed: boolean;
        reason?: undefined;
    }>;
    getAvailableRegions(productId: string): Promise<string[]>;
    calculateVAT(productId: string, amount: string): Promise<{
        baseAmount: number;
        vatAmount: number;
        totalAmount: number;
        vatRate: number;
        isExempt: boolean;
    }>;
    getBusinessRegistrationInfo(): {
        businessName: string;
        kraPin: string;
        vatNumber: string;
        businessPermit: string;
        tradingLicense: string;
        address: {
            physical: string;
            postal: string;
        };
        contact: {
            phone: string;
            email: string;
        };
        registrationDate: string;
        renewalDate: string;
    };
    generateVATReport(startDate: string, endDate: string): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalSales: number;
        exemptSales: number;
        taxableSales: number;
        totalVAT: number;
        vatRate: number;
        orderCount: number;
    }>;
    getConsumerRights(): {
        rightToInformation: {
            title: string;
            description: string;
            details: string[];
        };
        rightToChoose: {
            title: string;
            description: string;
            details: string[];
        };
        rightToSafety: {
            title: string;
            description: string;
            details: string[];
        };
        rightToRedress: {
            title: string;
            description: string;
            details: string[];
        };
        rightToPrivacy: {
            title: string;
            description: string;
            details: string[];
        };
    };
    getReturnPolicy(): Promise<{
        returnPeriod: string;
        conditions: string[];
        process: string[];
        exceptions: string[];
        refundMethods: string[];
    }>;
    getWarrantyInfo(productId: string): Promise<{
        product: string;
        warrantyPeriod: string;
        warrantyType: string;
        terms: string | string[];
        claimProcess: string[];
    }>;
    recordConsumerComplaint(complaintData: any, req: any): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        userId: string;
        type: string;
        status: string;
    }>;
    initiateDispute(disputeData: any, req: any): Promise<{
        id: string;
        description: string;
        userId: string;
        type: string;
        status: string;
        initiatedAt: Date;
        escalatedAt: Date | null;
        escalationReason: string | null;
        assignedDepartment: string | null;
    }>;
    getDisputeResolutionProcess(): Promise<{
        steps: {
            step: number;
            title: string;
            description: string;
            timeframe: string;
        }[];
        totalTimeframe: string;
        escalationOptions: string[];
    }>;
    getDisputeHistory(req: any): Promise<{
        id: string;
        description: string;
        userId: string;
        type: string;
        status: string;
        initiatedAt: Date;
        escalatedAt: Date | null;
        escalationReason: string | null;
        assignedDepartment: string | null;
    }[]>;
    escalateDispute(disputeId: string, body: any): Promise<void>;
}
