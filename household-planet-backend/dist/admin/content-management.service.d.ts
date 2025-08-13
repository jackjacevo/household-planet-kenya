import { PrismaService } from '../prisma/prisma.service';
export declare class ContentManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomepageContent(): Promise<unknown>;
    updateHomepageContent(data: any): Promise<{
        success: boolean;
    }>;
    getPromotions(): Promise<unknown>;
    createPromotion(data: any): Promise<number>;
    updatePromotion(id: string, data: any): Promise<number>;
    getEmailTemplates(): Promise<unknown>;
    createEmailTemplate(data: any): Promise<number>;
    updateEmailTemplate(id: string, data: any): Promise<number>;
    getStaticPages(): Promise<unknown>;
    createStaticPage(data: any): Promise<number>;
    updateStaticPage(id: string, data: any): Promise<number>;
    getFAQs(): Promise<unknown>;
    createFAQ(data: any): Promise<number>;
    updateFAQ(id: string, data: any): Promise<number>;
    deleteFAQ(id: string): Promise<number>;
    getBlogPosts(): Promise<unknown>;
    createBlogPost(data: any): Promise<number>;
    updateBlogPost(id: string, data: any): Promise<number>;
    deleteBlogPost(id: string): Promise<number>;
    private upsertContent;
    searchContent(query: string, type?: string): Promise<unknown>;
    backupContent(): Promise<unknown>;
    getContentStats(): Promise<unknown>;
    private generateId;
}
