import { PrismaService } from '../prisma/prisma.service';
export declare class SeoService {
    private prisma;
    constructor(prisma: PrismaService);
    generateProductAltText(productId: string): Promise<string>;
    generateCategoryContent(categoryId: string): Promise<{
        metaTitle: string;
        metaDescription: string;
        content: string;
        keywords: string[];
    }>;
    generateSitemap(): Promise<string>;
    optimizeProductSEO(productId: string): Promise<{
        metaTitle: string;
        metaDescription: string;
        structuredData: {
            '@context': string;
            '@type': string;
            name: string;
            description: string;
            image: string;
            brand: string;
            offers: {
                '@type': string;
                price: number;
                priceCurrency: string;
                availability: string;
            };
            aggregateRating: {
                '@type': string;
                ratingValue: number;
                reviewCount: number;
            };
        };
    }>;
}
