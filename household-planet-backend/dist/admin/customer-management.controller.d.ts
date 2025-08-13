import { CustomerManagementService } from './customer-management.service';
export declare class CustomerManagementController {
    private customerManagementService;
    constructor(customerManagementService: CustomerManagementService);
    getCustomers(filters: any): Promise<({
        orders: {
            id: string;
            createdAt: Date;
            status: string;
            total: number;
        }[];
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
        supportTickets: {
            id: string;
            status: string;
        }[];
        loyaltyTransactions: {
            type: string;
            points: number;
        }[];
    } & {
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
    })[]>;
    getCustomerStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        newThisMonth: number;
        topSpenders: {
            name: string;
            email: string;
            id: string;
            totalSpent: number;
        }[];
    }>;
    getCustomerSegment(type: string): Promise<({
        orders: {
            createdAt: Date;
            total: number;
        }[];
    } & {
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
    })[]>;
    getCustomer(id: string): Promise<{
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
                tags: string | null;
                stock: number;
                lowStockThreshold: number;
                trackInventory: boolean;
                averageRating: number | null;
                totalReviews: number;
                viewCount: number;
                searchKeywords: string | null;
                relatedProducts: string | null;
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
        orders: ({
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
                    tags: string | null;
                    stock: number;
                    lowStockThreshold: number;
                    trackInventory: boolean;
                    averageRating: number | null;
                    totalReviews: number;
                    viewCount: number;
                    searchKeywords: string | null;
                    relatedProducts: string | null;
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
        } & {
            deliveryLocation: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            status: string;
            total: number;
            orderNumber: string;
            subtotal: number;
            shippingCost: number;
            discount: number;
            shippingAddress: string;
            deliveryPrice: number;
            paymentMethod: string;
            paymentStatus: string;
            promoCodeId: string | null;
            guestEmail: string | null;
            guestName: string | null;
            guestPhone: string | null;
        })[];
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
        supportTickets: ({
            replies: {
                id: string;
                createdAt: Date;
                message: string;
                ticketId: string;
                isStaff: boolean;
            }[];
        } & {
            category: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            message: string;
            status: string;
            orderId: string | null;
            subject: string;
            priority: string;
        })[];
        loyaltyTransactions: {
            id: string;
            description: string;
            createdAt: Date;
            userId: string;
            type: string;
            orderId: string | null;
            points: number;
        }[];
    } & {
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
    }>;
    getCustomerInsights(id: string): Promise<{
        totalOrders: number;
        totalSpent: number;
        avgOrderValue: number;
        daysSinceLastOrder: number;
        ordersByStatus: {};
        favoriteProducts: {
            name: string;
            quantity: unknown;
        }[];
        loyaltyPoints: number;
        supportTickets: number;
        addresses: number;
        reviews: number;
    }>;
    getCommunicationLog(id: string): Promise<({
        type: string;
        id: string;
        subject: string;
        status: string;
        createdAt: Date;
        replies: number;
    } | {
        type: string;
        id: string;
        subject: string;
        status: string;
        createdAt: Date;
        notes: string;
    } | {
        type: string;
        id: string;
        subject: string;
        status: string;
        createdAt: Date;
        points: number;
    })[]>;
    updateCustomer(id: string, data: any): Promise<{
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
    }>;
    addCustomerTag(id: string, data: {
        tag: string;
    }): Promise<{
        message: string;
    }>;
    removeCustomerTag(id: string, tag: string): Promise<{
        message: string;
    }>;
    manageLoyaltyPoints(id: string, data: {
        points: number;
        type: string;
        description: string;
    }): Promise<{
        transaction: {
            id: string;
            description: string;
            createdAt: Date;
            userId: string;
            type: string;
            orderId: string | null;
            points: number;
        };
        user: {
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
        };
    }>;
    createSupportTicket(id: string, data: any): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        status: string;
        orderId: string | null;
        subject: string;
        priority: string;
    }>;
    updateSupportTicket(ticketId: string, data: any): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        status: string;
        orderId: string | null;
        subject: string;
        priority: string;
    }>;
    addTicketReply(ticketId: string, data: {
        message: string;
        isStaff?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        ticketId: string;
        isStaff: boolean;
    }>;
    verifyAddress(id: string, addressId: string): Promise<{
        isValid: string;
        address: {
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
        };
        suggestions: string[];
    }>;
}
