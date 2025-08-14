import { OrderManagementService } from './order-management.service';
export declare class OrderManagementController {
    private orderManagementService;
    constructor(orderManagementService: OrderManagementService);
    getOrders(filters: any): Promise<({
        user: {
            name: string;
            email: string;
            phone: string;
        };
        deliveryTracking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            orderId: string;
            deliveredAt: Date | null;
            notes: string | null;
            location: string | null;
            photoProof: string | null;
        };
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
            variant: {
                name: string;
                id: string;
                sku: string;
                price: number;
                isActive: boolean;
                stock: number;
                lowStockThreshold: number;
                productId: string;
                attributes: string | null;
                size: string | null;
                color: string | null;
                material: string | null;
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
        statusHistory: {
            id: string;
            createdAt: Date;
            status: string;
            orderId: string;
            notes: string | null;
        }[];
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
        estimatedDeliveryDate: Date | null;
    })[]>;
    getOrderStats(): Promise<{
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    }>;
    getOrder(id: string): Promise<{
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
            optedOutAt: Date | null;
            phoneNumber: string | null;
            privacySettings: string | null;
        };
        deliveryTracking: {
            updates: {
                id: string;
                status: string;
                notes: string | null;
                location: string | null;
                timestamp: Date;
                trackingId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            orderId: string;
            deliveredAt: Date | null;
            notes: string | null;
            location: string | null;
            photoProof: string | null;
        };
        returnRequests: ({
            items: {
                id: string;
                orderItemId: string;
                reason: string;
                condition: string | null;
                returnRequestId: string;
            }[];
        } & {
            id: string;
            description: string | null;
            images: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: string;
            orderId: string;
            reason: string;
        })[];
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
            variant: {
                name: string;
                id: string;
                sku: string;
                price: number;
                isActive: boolean;
                stock: number;
                lowStockThreshold: number;
                productId: string;
                attributes: string | null;
                size: string | null;
                color: string | null;
                material: string | null;
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
        statusHistory: {
            id: string;
            createdAt: Date;
            status: string;
            orderId: string;
            notes: string | null;
        }[];
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
        estimatedDeliveryDate: Date | null;
    }>;
    updateOrderStatus(id: string, data: {
        status: string;
        notes?: string;
    }): Promise<{
        order: {
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
            estimatedDeliveryDate: Date | null;
        };
        statusHistory: {
            id: string;
            createdAt: Date;
            status: string;
            orderId: string;
            notes: string | null;
        };
    }>;
    bulkUpdateOrders(data: {
        orderIds: string[];
        updates: any;
    }): Promise<any[]>;
    verifyPayment(id: string): Promise<{
        verified: boolean;
        payment: {
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
        };
    }>;
    generateShippingLabel(id: string): Promise<{
        orderNumber: string;
        customerName: string;
        shippingAddress: string;
        deliveryLocation: string;
        items: {
            name: string;
            quantity: number;
            weight: number;
        }[];
        totalWeight: number;
        trackingNumber: string;
    }>;
    updateDeliveryStatus(id: string, data: {
        status: string;
        location?: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        orderId: string;
        deliveredAt: Date | null;
        notes: string | null;
        location: string | null;
        photoProof: string | null;
    }>;
    addOrderNote(id: string, data: {
        notes: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        notes: string | null;
    }>;
    processReturn(id: string, data: {
        status: 'APPROVED' | 'REJECTED';
        notes?: string;
    }): Promise<{
        order: {
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
            estimatedDeliveryDate: Date | null;
        };
        items: ({
            orderItem: {
                id: string;
                price: number;
                productId: string;
                variantId: string | null;
                quantity: number;
                orderId: string;
                total: number;
            };
        } & {
            id: string;
            orderItemId: string;
            reason: string;
            condition: string | null;
            returnRequestId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        images: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        orderId: string;
        reason: string;
    }>;
    sendCustomerEmail(id: string, data: {
        template: string;
        customMessage?: string;
    }): Promise<{
        sent: boolean;
        recipient: string;
        subject: any;
        message: any;
    }>;
}
