export declare class CreateVariantDto {
    name: string;
    sku: string;
    price: number;
    stock?: number;
    lowStockThreshold?: number;
    size?: string;
    color?: string;
    material?: string;
    isActive?: boolean;
    attributes?: string;
}
