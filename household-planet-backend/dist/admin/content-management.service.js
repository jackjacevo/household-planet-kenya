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
        return this.prisma.page.findMany({
            where: { slug: { startsWith: 'homepage' } },
            orderBy: { createdAt: 'asc' }
        });
    }
    async updateHomepageContent(data) {
        const { title, content, seoTitle, seoDescription } = data;
        return this.prisma.page.upsert({
            where: { slug: 'homepage' },
            update: {
                title: title || 'Homepage',
                content: content || '',
                seoTitle,
                seoDescription,
                updatedAt: new Date()
            },
            create: {
                title: title || 'Homepage',
                slug: 'homepage',
                content: content || '',
                seoTitle,
                seoDescription,
                isActive: true
            }
        });
    }
    async getPromotions() {
        return this.prisma.blogPost.findMany({
            where: { tags: { contains: 'promotion' } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createPromotion(data) {
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return this.prisma.blogPost.create({
            data: {
                title: data.title,
                slug: `promo-${slug}-${Date.now()}`,
                content: data.content,
                featuredImage: data.image,
                tags: 'promotion',
                status: data.isActive ? 'PUBLISHED' : 'DRAFT',
                publishedAt: data.isActive ? new Date() : null
            }
        });
    }
    async updatePromotion(id, data) {
        return this.prisma.blogPost.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                featuredImage: data.image,
                status: data.isActive ? 'PUBLISHED' : 'DRAFT',
                publishedAt: data.isActive && !data.publishedAt ? new Date() : data.publishedAt
            }
        });
    }
    async getEmailTemplates() {
        return this.prisma.page.findMany({
            where: { slug: { startsWith: 'email-template' } },
            orderBy: { title: 'asc' }
        });
    }
    async createEmailTemplate(data) {
        const slug = `email-template-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        return this.prisma.page.create({
            data: {
                title: data.name,
                slug,
                content: data.content,
                seoTitle: data.subject,
                seoDescription: `Email template: ${data.name}`,
                isActive: data.isActive
            }
        });
    }
    async updateEmailTemplate(id, data) {
        return this.prisma.page.update({
            where: { id },
            data: {
                title: data.name,
                content: data.content,
                seoTitle: data.subject,
                isActive: data.isActive
            }
        });
    }
    async getStaticPages() {
        return this.prisma.page.findMany({
            where: {
                slug: {
                    notIn: ['homepage', 'email-template']
                }
            },
            orderBy: { title: 'asc' }
        });
    }
    async createStaticPage(data) {
        return this.prisma.page.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                seoTitle: data.metaTitle,
                seoDescription: data.metaDescription,
                isActive: data.isActive
            }
        });
    }
    async updateStaticPage(id, data) {
        return this.prisma.page.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                seoTitle: data.metaTitle,
                seoDescription: data.metaDescription,
                isActive: data.isActive
            }
        });
    }
    async getFAQs() {
        return this.prisma.fAQ.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
        });
    }
    async createFAQ(data) {
        return this.prisma.fAQ.create({
            data: {
                question: data.question,
                answer: data.answer,
                category: data.category,
                sortOrder: data.sortOrder || 0,
                isActive: data.isActive
            }
        });
    }
    async updateFAQ(id, data) {
        return this.prisma.fAQ.update({
            where: { id },
            data: {
                question: data.question,
                answer: data.answer,
                category: data.category,
                sortOrder: data.sortOrder,
                isActive: data.isActive
            }
        });
    }
    async deleteFAQ(id) {
        return this.prisma.fAQ.delete({ where: { id } });
    }
    async getBlogPosts() {
        return this.prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async createBlogPost(data) {
        return this.prisma.blogPost.create({
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                featuredImage: data.image,
                authorId: data.author,
                tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
                seoTitle: data.metaTitle,
                seoDescription: data.metaDescription,
                publishedAt: data.publishedAt,
                status: data.isActive ? 'PUBLISHED' : 'DRAFT'
            }
        });
    }
    async updateBlogPost(id, data) {
        return this.prisma.blogPost.update({
            where: { id },
            data: {
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
                featuredImage: data.image,
                tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
                seoTitle: data.metaTitle,
                seoDescription: data.metaDescription,
                status: data.isActive ? 'PUBLISHED' : 'DRAFT'
            }
        });
    }
    async deleteBlogPost(id) {
        return this.prisma.blogPost.delete({ where: { id } });
    }
    async searchContent(query, type) {
        const results = [];
        if (!type || type === 'page') {
            const pages = await this.prisma.page.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { content: { contains: query } }
                    ]
                }
            });
            results.push(...pages.map(p => ({ ...p, type: 'page' })));
        }
        if (!type || type === 'blog') {
            const posts = await this.prisma.blogPost.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { content: { contains: query } }
                    ]
                }
            });
            results.push(...posts.map(p => ({ ...p, type: 'blog' })));
        }
        if (!type || type === 'faq') {
            const faqs = await this.prisma.fAQ.findMany({
                where: {
                    OR: [
                        { question: { contains: query } },
                        { answer: { contains: query } }
                    ]
                }
            });
            results.push(...faqs.map(f => ({ ...f, type: 'faq' })));
        }
        return results;
    }
    async backupContent() {
        const [pages, posts, faqs] = await Promise.all([
            this.prisma.page.findMany({ orderBy: { createdAt: 'asc' } }),
            this.prisma.blogPost.findMany({ orderBy: { createdAt: 'asc' } }),
            this.prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } })
        ]);
        return {
            pages,
            posts,
            faqs
        };
    }
    async getContentStats() {
        const [pageCount, postCount, faqCount] = await Promise.all([
            this.prisma.page.count(),
            this.prisma.blogPost.count(),
            this.prisma.fAQ.count()
        ]);
        return {
            pages: { count: pageCount, type: 'page' },
            posts: { count: postCount, type: 'blog' },
            faqs: { count: faqCount, type: 'faq' }
        };
    }
};
exports.ContentManagementService = ContentManagementService;
exports.ContentManagementService = ContentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentManagementService);
//# sourceMappingURL=content-management.service.js.map