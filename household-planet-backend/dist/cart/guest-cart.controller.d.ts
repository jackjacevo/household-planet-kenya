import { GuestCartService } from './guest-cart.service';
interface GuestCartItem {
    productId: string;
    variantId?: string;
    quantity: number;
}
export declare class GuestCartController {
    private guestCartService;
    constructor(guestCartService: GuestCartService);
    validateGuestCart(body: {
        items: GuestCartItem[];
    }): Promise<{
        items: any[];
        total: number;
        itemCount: number;
    }>;
}
export {};
