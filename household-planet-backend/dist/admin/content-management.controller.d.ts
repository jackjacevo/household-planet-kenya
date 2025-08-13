import { ContentManagementService } from './content-management.service';
export declare class ContentManagementController {
    private contentManagementService;
    constructor(contentManagementService: ContentManagementService);
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
    searchContent(query: string, type?: string): Promise<unknown>;
    getContentStats(): Promise<unknown>;
    backupContent(): Promise<unknown>;
}
