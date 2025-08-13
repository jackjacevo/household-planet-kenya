import { PrismaService } from '../prisma/prisma.service';
export declare class WhatsAppTemplateService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createTemplate(name: string, type: string, template: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }>;
    getTemplate(name: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }>;
    getAllTemplates(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }[]>;
    updateTemplate(name: string, template: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }>;
    renderTemplate(templateName: string, variables: Record<string, any>): Promise<string>;
    seedDefaultTemplates(): Promise<void>;
}
