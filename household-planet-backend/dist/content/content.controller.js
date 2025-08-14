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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const content_service_1 = require("./content.service");
const blog_service_1 = require("./blog.service");
const seo_service_1 = require("./seo.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let ContentController = class ContentController {
    constructor(contentService, blogService, seoService) {
        this.contentService = contentService;
        this.blogService = blogService;
        this.seoService = seoService;
    }
    async search(query, type, category, limit) {
        return this.contentService.searchContent(query, {
            type,
            category,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
    async getBlogPosts(page = '1', limit = '10', status = 'PUBLISHED') {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        return this.blogService.getPosts({
            skip,
            take: parseInt(limit),
            status,
        });
    }
    async getBlogPost(slug) {
        return this.blogService.getPostBySlug(slug);
    }
    async getFAQs(category) {
        return this.contentService.getFAQs(category);
    }
    async getPage(slug) {
        return this.contentService.getPageBySlug(slug);
    }
    async getSitemap() {
        const sitemap = await this.seoService.generateSitemap();
        return { sitemap, contentType: 'application/xml' };
    }
    async createBlogPost(data) {
        return this.blogService.createPost(data);
    }
    async createFAQ(data) {
        return this.contentService.createFAQ(data);
    }
    async createPage(data) {
        return this.contentService.createPage(data);
    }
    async optimizeAllContent() {
        return this.contentService.optimizeAllContent();
    }
    async optimizeProductSEO(productId) {
        const result = await this.seoService.optimizeProductSEO(productId);
        if (!result) {
            return { error: 'Product not found' };
        }
        return { message: 'Product SEO optimized successfully', data: result };
    }
    async generateCategoryContent(categoryId) {
        const result = await this.seoService.generateCategoryContent(categoryId);
        if (!result) {
            return { error: 'Category not found' };
        }
        return { message: 'Category content generated successfully', data: result };
    }
    async getSearchAnalytics(days) {
        return this.contentService.getSearchAnalytics(days ? parseInt(days) : undefined);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "search", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('blog'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getBlogPosts", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('blog/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getBlogPost", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('faqs'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getFAQs", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('page/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getPage", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('sitemap.xml'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getSitemap", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    (0, common_1.Post)('blog'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createBlogPost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    (0, common_1.Post)('faqs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createFAQ", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    (0, common_1.Post)('pages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createPage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('optimize-seo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "optimizeAllContent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('product/:id/optimize-seo'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "optimizeProductSEO", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('category/:id/generate-content'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "generateCategoryContent", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('analytics/search'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getSearchAnalytics", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)('api/content'),
    __metadata("design:paramtypes", [content_service_1.ContentService,
        blog_service_1.BlogService,
        seo_service_1.SeoService])
], ContentController);
//# sourceMappingURL=content.controller.js.map