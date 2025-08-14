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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BlogService = class BlogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPost(data) {
        return this.prisma.blogPost.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                tags: data.tags,
                featuredImage: data.featuredImage,
                authorId: data.authorId,
                status: data.status || 'DRAFT',
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
            },
        });
    }
    async getPosts(params) {
        const where = {};
        if (params.status) {
            where.status = params.status;
        }
        return this.prisma.blogPost.findMany({
            where,
            skip: params.skip || 0,
            take: params.take || 10,
            orderBy: { publishedAt: 'desc' },
        });
    }
    async getPostBySlug(slug) {
        return this.prisma.blogPost.findUnique({
            where: { slug },
        });
    }
    async updatePost(id, data) {
        const updateData = { ...data };
        if (data.status === 'PUBLISHED' && !data.publishedAt) {
            updateData.publishedAt = new Date();
        }
        return this.prisma.blogPost.update({
            where: { id },
            data: updateData,
        });
    }
    async deletePost(id) {
        return this.prisma.blogPost.delete({
            where: { id },
        });
    }
    async getRelatedPosts(postId, limit = 3) {
        return this.prisma.blogPost.findMany({
            where: {
                id: { not: postId },
                status: 'PUBLISHED',
            },
            take: limit,
            orderBy: { publishedAt: 'desc' },
        });
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map