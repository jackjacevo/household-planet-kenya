declare class ReturnItemDto {
    orderItemId: string;
    reason: string;
    condition?: string;
}
export declare class ReturnRequestDto {
    items: ReturnItemDto[];
    reason: string;
    description?: string;
    images?: string[];
}
export {};
