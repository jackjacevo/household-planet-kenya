declare class OrderItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress: string;
    deliveryLocation: string;
    paymentMethod: string;
    notes?: string;
}
export {};
