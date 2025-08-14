import { PrismaService } from '../../prisma/prisma.service';
import { SearchFiltersDto } from '../dto/search-filters.dto';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    advancedSearch(filters: SearchFiltersDto): Promise<{
        products: {
            images: any;
            tags: any;
            relatedProducts: any;
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
            categoryId: string;
            brandId: string | null;
            isActive: boolean;
            isFeatured: boolean;
            seoTitle: string | null;
            seoDescription: string | null;
            metaDescription: string | null;
            keywords: string | null;
            stock: number;
            lowStockThreshold: number;
            trackInventory: boolean;
            averageRating: number | null;
            totalReviews: number;
            viewCount: number;
            searchKeywords: string | null;
            ageRestricted: boolean;
            minimumAge: number | null;
            warrantyPeriod: string | null;
            warrantyType: string | null;
            warrantyTerms: string | null;
            geographicRestrictions: string | null;
            restrictedRegions: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        filters: {
            availableColors: string[];
            availableSizes: string[];
            availableMaterials: string[];
            priceRange: {
                min: number;
                max: number;
            };
        };
    }>;
    getSearchSuggestions(query: string, limit?: number): Promise<{
        name: string;
        slug: string;
    }[]>;
    private getAvailableColors;
    private getAvailableSizes;
    private getAvailableMaterials;
    private getPriceRange;
}
