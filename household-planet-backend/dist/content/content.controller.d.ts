import { ContentService } from './content.service';
import { BlogService } from './blog.service';
import { SeoService } from './seo.service';
export declare class ContentController {
    private contentService;
    private blogService;
    private seoService;
    constructor(contentService: ContentService, blogService: BlogService, seoService: SeoService);
    search(query: string, type?: 'product' | 'blog' | 'page', category?: string, limit?: string): Promise<{
        query: string;
        results: any[];
        total: number;
    }>;
    getBlogPosts(page?: string, limit?: string, status?: string): Promise<{
        id: string;
        slug: string;
        seoTitle: string | null;
        seoDescription: string | null;
        tags: string | null;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        content: string;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: Date | null;
        authorId: string | null;
    }[]>;
    getBlogPost(slug: string): Promise<{
        id: string;
        slug: string;
        seoTitle: string | null;
        seoDescription: string | null;
        tags: string | null;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        content: string;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: Date | null;
        authorId: string | null;
    }>;
    getFAQs(category?: string): Promise<{
        category: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        question: string;
        answer: string;
    }[]>;
    getPage(slug: string): Promise<{
        id: string;
        slug: string;
        isActive: boolean;
        seoTitle: string | null;
        seoDescription: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
    }>;
    getSitemap(): Promise<{
        sitemap: string;
        contentType: string;
    }>;
    createBlogPost(data: any): Promise<{
        id: string;
        slug: string;
        seoTitle: string | null;
        seoDescription: string | null;
        tags: string | null;
        viewCount: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        content: string;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: Date | null;
        authorId: string | null;
    }>;
    createFAQ(data: any): Promise<{
        category: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        question: string;
        answer: string;
    }>;
    createPage(data: any): Promise<{
        id: string;
        slug: string;
        isActive: boolean;
        seoTitle: string | null;
        seoDescription: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
    }>;
    optimizeAllContent(): Promise<{
        optimizedProducts: number;
        optimizedCategories: number;
    }>;
    optimizeProductSEO(productId: string): Promise<{
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        message: string;
        data: {
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
        };
        error?: undefined;
    }>;
    generateCategoryContent(categoryId: string): Promise<{
        error: string;
        message?: undefined;
        data?: undefined;
    } | {
        message: string;
        data: {
            metaTitle: string;
            metaDescription: string;
            content: string;
            keywords: string[];
        };
        error?: undefined;
    }>;
    getSearchAnalytics(days?: string): Promise<{
        totalSearches: number;
        topQueries: {
            query: string;
            count: number;
        }[];
        noResultQueries: {
            query: string;
            count: number;
        }[];
    }>;
}
