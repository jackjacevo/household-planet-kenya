export declare class BulkProductDto {
    name: string;
    sku: string;
    description: string;
    shortDescription?: string;
    price: number;
    comparePrice?: number;
    categoryId: string;
    stock?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
    variants?: {
        name: string;
        sku: string;
        price: number;
        stock: number;
        size?: string;
        color?: string;
        material?: string;
        lowStockThreshold?: number;
    }[];
    tags?: string[];
    images?: string[];
}
