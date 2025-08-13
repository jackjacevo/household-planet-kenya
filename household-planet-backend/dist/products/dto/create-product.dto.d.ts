export declare class CreateProductDto {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    sku: string;
    price: number;
    comparePrice?: number;
    weight?: number;
    dimensions?: string;
    images?: string[];
    categoryId: string;
    brandId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    stock?: number;
    lowStockThreshold?: number;
    trackInventory?: boolean;
}
