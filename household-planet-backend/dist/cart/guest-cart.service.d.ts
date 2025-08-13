import { PrismaService } from '../prisma/prisma.service';
interface GuestCartItem {
    productId: string;
    variantId?: string;
    quantity: number;
}
export declare class GuestCartService {
    private prisma;
    constructor(prisma: PrismaService);
    validateGuestCart(items: GuestCartItem[]): Promise<{
        items: any[];
        total: number;
        itemCount: number;
    }>;
    mergeGuestCartWithUserCart(userId: string, guestCartItems: GuestCartItem[]): Promise<void>;
}
export {};
