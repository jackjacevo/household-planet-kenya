import { PrismaService } from '../prisma/prisma.service';
export declare class PerformanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getOptimizedProducts(page?: number, limit?: number, category?: string): Promise<{
        category: {
            name: string;
            slug: string;
        };
        name: string;
        id: string;
        slug: string;
        price: number;
        comparePrice: number;
        images: string;
        stock: number;
        averageRating: number;
        totalReviews: number;
    }[]>;
    getCachedProduct(slug: string): Promise<{
        category: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            metaDescription: string | null;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        };
        variants: {
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
        }[];
        reviews: ({
            user: {
                name: string;
            };
        } & {
            id: string;
            images: string | null;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            userId: string;
            rating: number;
            title: string | null;
            comment: string | null;
            isVerified: boolean;
            isHelpful: number;
        })[];
        _count: {
            reviews: number;
        };
    } & {
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
    }>;
    trackPageLoad(url: string, loadTime: number, userId?: string): Promise<{
        id: string;
        userId: string | null;
        timestamp: Date;
        url: string;
        loadTime: number;
    }>;
    getPerformanceStats(): Promise<{
        averageLoadTime: number;
        slowestPages: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PerformanceMetricGroupByOutputType, "url"[]> & {
            _count: {
                url: number;
            };
            _avg: {
                loadTime: number;
            };
        })[];
    }>;
    getOptimizedImageUrl(originalUrl: string, width?: number, quality?: number): string;
}
