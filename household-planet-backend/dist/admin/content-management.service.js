"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContentManagementService = class ContentManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomepageContent() {
        return this.prisma.$queryRaw `
      SELECT * FROM content WHERE type = 'homepage' ORDER BY sort_order ASC
    `;
    }
    async updateHomepageContent(data) {
        const { banners, sections } = data;
        for (const banner of banners || []) {
            await this.upsertContent('homepage_banner', banner.id, {
                title: banner.title,
                subtitle: banner.subtitle,
                image: banner.image,
                link: banner.link,
                isActive: banner.isActive,
                sortOrder: banner.sortOrder
            });
        }
        for (const section of sections || []) {
            await this.upsertContent('homepage_section', section.id, {
                title: section.title,
                content: section.content,
                type: section.type,
                isActive: section.isActive,
                sortOrder: section.sortOrder
            });
        }
        return { success: true };
    }
    async getPromotions() {
        return this.prisma.$queryRaw `
      SELECT * FROM content WHERE type = 'promotion' ORDER BY created_at DESC
    `;
    }
    async createPromotion(data) {
        return this.upsertContent('promotion', null, {
            title: data.title,
            content: data.content,
            image: data.image,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive,
            targetAudience: data.targetAudience
        });
    }
    async updatePromotion(id, data) {
        return this.upsertContent('promotion', id, data);
    }
    async getEmailTemplates() {
        return this.prisma.$queryRaw `
      SELECT * FROM content WHERE type = 'email_template' ORDER BY name ASC
    `;
    }
    async createEmailTemplate(data) {
        return this.upsertContent('email_template', null, {
            name: data.name,
            subject: data.subject,
            content: data.content,
            variables: JSON.stringify(data.variables || []),
            isActive: data.isActive
        });
    }
    async updateEmailTemplate(id, data) {
        return this.upsertContent('email_template', id, {
            ...data,
            variables: JSON.stringify(data.variables || [])
        });
    }
    async getStaticPages() {
        return this.prisma.$queryRaw `
      SELECT * FROM content WHERE type = 'static_page' ORDER BY name ASC
    `;
    }
    async createStaticPage(data) {
        return this.upsertContent('static_page', null, {
            name: data.name,
            slug: data.slug,
            title: data.title,
            content: data.content,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            isActive: data.isActive
        });
    }
    async updateStaticPage(id, data) {
        return this.upsertContent('static_page', id, data);
    }
    async getFAQs() {
        return this.prisma.$queryRaw `
      SELECT * FROM content WHERE type = 'faq' ORDER BY sort_order ASC, created_at DESC
    `;
    }
    async createFAQ(data) {
        return this.upsertContent('faq', null, {
            question: data.question,
            answer: data.answer,
            category: data.category,
            sortOrder: data.sortOrder || 0,
            isActive: data.isActive
        });
    }
    async updateFAQ(id, data) {
        return this.upsertContent('faq', id, data);
    }
    async deleteFAQ(id) {
        return this.prisma.$executeRaw `DELETE FROM content WHERE id = ${id} AND type = 'faq'`;
    }
    async getBlogPosts() {
        return this.prisma.$queryRaw `
      SELECT * FROM content WHERE type = 'blog_post' ORDER BY created_at DESC
    `;
    }
    async createBlogPost(data) {
        return this.upsertContent('blog_post', null, {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            image: data.image,
            author: data.author,
            tags: JSON.stringify(data.tags || []),
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            publishedAt: data.publishedAt,
            isActive: data.isActive
        });
    }
    async updateBlogPost(id, data) {
        return this.upsertContent('blog_post', id, {
            ...data,
            tags: JSON.stringify(data.tags || [])
        });
    }
    async deleteBlogPost(id) {
        return this.prisma.$executeRaw `DELETE FROM content WHERE id = ${id} AND type = 'blog_post'`;
    }
    async upsertContent(type, id, data) {
        const contentData = {
            type,
            data: JSON.stringify(data),
            updatedAt: new Date()
        };
        if (id) {
            return this.prisma.$executeRaw `
        UPDATE content SET 
          data = ${contentData.data},
          updated_at = ${contentData.updatedAt}
        WHERE id = ${id} AND type = ${type}
      `;
        }
        else {
            const newId = this.generateId();
            return this.prisma.$executeRaw `
        INSERT INTO content (id, type, data, created_at, updated_at)
        VALUES (${newId}, ${type}, ${contentData.data}, ${new Date()}, ${contentData.updatedAt})
      `;
        }
    }
    async searchContent(query, type) {
        let sql = `SELECT * FROM content WHERE data LIKE '%${query}%'`;
        if (type) {
            sql += ` AND type = '${type}'`;
        }
        sql += ` ORDER BY updated_at DESC`;
        return this.prisma.$queryRawUnsafe(sql);
    }
    async backupContent() {
        return this.prisma.$queryRaw `SELECT * FROM content ORDER BY type, created_at`;
    }
    async getContentStats() {
        const stats = await this.prisma.$queryRaw `
      SELECT 
        type,
        COUNT(*) as count,
        MAX(updated_at) as last_updated
      FROM content 
      GROUP BY type
    `;
        return stats;
    }
    generateId() {
        return 'cnt_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
exports.ContentManagementService = ContentManagementService;
exports.ContentManagementService = ContentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentManagementService);
//# sourceMappingURL=content-management.service.js.map