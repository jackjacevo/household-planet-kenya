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
exports.ContentManagementController = void 0;
const common_1 = require("@nestjs/common");
const content_management_service_1 = require("./content-management.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let ContentManagementController = class ContentManagementController {
    constructor(contentManagementService) {
        this.contentManagementService = contentManagementService;
    }
    async getHomepageContent() {
        return this.contentManagementService.getHomepageContent();
    }
    async updateHomepageContent(data) {
        return this.contentManagementService.updateHomepageContent(data);
    }
    async getPromotions() {
        return this.contentManagementService.getPromotions();
    }
    async createPromotion(data) {
        return this.contentManagementService.createPromotion(data);
    }
    async updatePromotion(id, data) {
        return this.contentManagementService.updatePromotion(id, data);
    }
    async getEmailTemplates() {
        return this.contentManagementService.getEmailTemplates();
    }
    async createEmailTemplate(data) {
        return this.contentManagementService.createEmailTemplate(data);
    }
    async updateEmailTemplate(id, data) {
        return this.contentManagementService.updateEmailTemplate(id, data);
    }
    async getStaticPages() {
        return this.contentManagementService.getStaticPages();
    }
    async createStaticPage(data) {
        return this.contentManagementService.createStaticPage(data);
    }
    async updateStaticPage(id, data) {
        return this.contentManagementService.updateStaticPage(id, data);
    }
    async getFAQs() {
        return this.contentManagementService.getFAQs();
    }
    async createFAQ(data) {
        return this.contentManagementService.createFAQ(data);
    }
    async updateFAQ(id, data) {
        return this.contentManagementService.updateFAQ(id, data);
    }
    async deleteFAQ(id) {
        return this.contentManagementService.deleteFAQ(id);
    }
    async getBlogPosts() {
        return this.contentManagementService.getBlogPosts();
    }
    async createBlogPost(data) {
        return this.contentManagementService.createBlogPost(data);
    }
    async updateBlogPost(id, data) {
        return this.contentManagementService.updateBlogPost(id, data);
    }
    async deleteBlogPost(id) {
        return this.contentManagementService.deleteBlogPost(id);
    }
    async searchContent(query, type) {
        return this.contentManagementService.searchContent(query, type);
    }
    async getContentStats() {
        return this.contentManagementService.getContentStats();
    }
    async backupContent() {
        return this.contentManagementService.backupContent();
    }
};
exports.ContentManagementController = ContentManagementController;
__decorate([
    (0, common_1.Get)('homepage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getHomepageContent", null);
__decorate([
    (0, common_1.Put)('homepage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "updateHomepageContent", null);
__decorate([
    (0, common_1.Get)('promotions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getPromotions", null);
__decorate([
    (0, common_1.Post)('promotions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "createPromotion", null);
__decorate([
    (0, common_1.Put)('promotions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "updatePromotion", null);
__decorate([
    (0, common_1.Get)('email-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getEmailTemplates", null);
__decorate([
    (0, common_1.Post)('email-templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "createEmailTemplate", null);
__decorate([
    (0, common_1.Put)('email-templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "updateEmailTemplate", null);
__decorate([
    (0, common_1.Get)('pages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getStaticPages", null);
__decorate([
    (0, common_1.Post)('pages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "createStaticPage", null);
__decorate([
    (0, common_1.Put)('pages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "updateStaticPage", null);
__decorate([
    (0, common_1.Get)('faqs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getFAQs", null);
__decorate([
    (0, common_1.Post)('faqs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "createFAQ", null);
__decorate([
    (0, common_1.Put)('faqs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "updateFAQ", null);
__decorate([
    (0, common_1.Delete)('faqs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "deleteFAQ", null);
__decorate([
    (0, common_1.Get)('blog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getBlogPosts", null);
__decorate([
    (0, common_1.Post)('blog'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "createBlogPost", null);
__decorate([
    (0, common_1.Put)('blog/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "updateBlogPost", null);
__decorate([
    (0, common_1.Delete)('blog/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "deleteBlogPost", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "searchContent", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "getContentStats", null);
__decorate([
    (0, common_1.Get)('backup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentManagementController.prototype, "backupContent", null);
exports.ContentManagementController = ContentManagementController = __decorate([
    (0, common_1.Controller)('api/admin/content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [content_management_service_1.ContentManagementService])
], ContentManagementController);
//# sourceMappingURL=content-management.controller.js.map