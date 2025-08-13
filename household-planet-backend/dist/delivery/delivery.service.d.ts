import { PrismaService } from '../prisma/prisma.service';
export declare class DeliveryService {
    private prisma;
    constructor(prisma: PrismaService);
    initializeLocations(): Promise<void>;
    getAllLocations(): Promise<{
        name: string;
        id: string;
        description: string | null;
        price: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        estimatedDays: number;
        expressPrice: number | null;
        tier: number;
        expressAvailable: boolean;
    }[]>;
    getLocationByName(name: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        price: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        estimatedDays: number;
        expressPrice: number | null;
        tier: number;
        expressAvailable: boolean;
    }>;
    calculateDeliveryPrice(locationName: string, isExpress?: boolean): Promise<number>;
    getDeliveryEstimate(locationName: string): Promise<{
        standardPrice: number;
        estimatedDays: number;
        expressAvailable: boolean;
        expressPrice: number;
    }>;
    calculateBulkDiscount(subtotal: number, itemCount: number): Promise<number>;
    getLocationsByTier(tier: number): Promise<{
        name: string;
        id: string;
        description: string | null;
        price: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        estimatedDays: number;
        expressPrice: number | null;
        tier: number;
        expressAvailable: boolean;
    }[]>;
}
