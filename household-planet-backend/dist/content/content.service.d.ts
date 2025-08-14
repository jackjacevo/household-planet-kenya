import { PrismaService } from '../prisma/prisma.service';
import { BlogService } from './blog.service';
import { SeoService } from './seo.service';
export declare class ContentService {
    private prisma;
    private blogService;
    private seoService;
    constructor(prisma: PrismaService, blogService: BlogService, seoService: SeoService);
    createFAQ(data: {
        question: string;
        answer: string;
        category: string;
    }): Promise<{
        category: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        question: string;
        answer: string;
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
    createPage(data: {
        title: string;
        slug: string;
        content: string;
        seoTitle?: string;
        seoDescription?: string;
    }): Promise<{
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
    getPageBySlug(slug: string): Promise<{
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
    searchContent(query: string, filters?: {
        type?: 'product' | 'blog' | 'page';
        category?: string;
        limit?: number;
    }): Promise<{
        query: string;
        results: any[];
        total: number;
    }>;
    private logSearchQuery;
    getSearchAnalytics(days?: number): Promise<{
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
    optimizeAllContent(): Promise<{
        optimizedProducts: number;
        optimizedCategories: number;
    }>;
}
