declare class GuestOrderItem {
    productId: string;
    variantId?: string;
    quantity: number;
}
export declare class GuestCheckoutDto {
    items: GuestOrderItem[];
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    shippingAddress: string;
    deliveryLocation: string;
    paymentMethod: string;
    promoCode?: string;
    phoneNumber?: string;
}
export {};
