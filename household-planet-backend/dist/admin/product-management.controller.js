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
exports.CategoryManagementController = exports.ProductManagementController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const product_management_service_1 = require("./product-management.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const multer_1 = require("multer");
const path_1 = require("path");
let ProductManagementController = class ProductManagementController {
    constructor(productManagementService) {
        this.productManagementService = productManagementService;
    }
    async createProduct(data) {
        return this.productManagementService.createProduct(data);
    }
    async updateProduct(id, data) {
        return this.productManagementService.updateProduct(id, data);
    }
    async deleteProduct(id) {
        return this.productManagementService.deleteProduct(id);
    }
    async bulkUpdateProducts(updates) {
        return this.productManagementService.bulkUpdateProducts(updates);
    }
    async bulkDeleteProducts({ ids }) {
        return this.productManagementService.bulkDeleteProducts(ids);
    }
    async importCSV(file) {
        return this.productManagementService.importProductsFromCSV(file.path);
    }
    async exportCSV() {
        return this.productManagementService.exportProductsToCSV();
    }
    async uploadImages(id, files) {
        const imagePaths = files.map(file => `/uploads/products/${file.filename}`);
        return this.productManagementService.updateProduct(id, {
            images: JSON.stringify(imagePaths)
        });
    }
    async createVariant(productId, data) {
        return this.productManagementService.createVariant(productId, data);
    }
    async updateVariant(id, data) {
        return this.productManagementService.updateVariant(id, data);
    }
    async deleteVariant(id) {
        return this.productManagementService.deleteVariant(id);
    }
    async getProductAnalytics(id) {
        return this.productManagementService.getProductAnalytics(id);
    }
};
exports.ProductManagementController = ProductManagementController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Put)('bulk/update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "bulkUpdateProducts", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "bulkDeleteProducts", null);
__decorate([
    (0, common_1.Post)('import/csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/imports',
            filename: (req, file, cb) => {
                cb(null, `products-${Date.now()}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "importCSV", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "exportCSV", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}-${file.originalname}`);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Post)(':id/variants'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "createVariant", null);
__decorate([
    (0, common_1.Put)('variants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "updateVariant", null);
__decorate([
    (0, common_1.Delete)('variants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "deleteVariant", null);
__decorate([
    (0, common_1.Get)(':id/analytics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductManagementController.prototype, "getProductAnalytics", null);
exports.ProductManagementController = ProductManagementController = __decorate([
    (0, common_1.Controller)('api/admin/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [product_management_service_1.ProductManagementService])
], ProductManagementController);
let CategoryManagementController = class CategoryManagementController {
    constructor(productManagementService) {
        this.productManagementService = productManagementService;
    }
    async createCategory(data) {
        return this.productManagementService.createCategory(data);
    }
    async updateCategory(id, data) {
        return this.productManagementService.updateCategory(id, data);
    }
    async reorderCategories(orders) {
        return this.productManagementService.reorderCategories(orders);
    }
};
exports.CategoryManagementController = CategoryManagementController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryManagementController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CategoryManagementController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Put)('reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CategoryManagementController.prototype, "reorderCategories", null);
exports.CategoryManagementController = CategoryManagementController = __decorate([
    (0, common_1.Controller)('api/admin/categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [product_management_service_1.ProductManagementService])
], CategoryManagementController);
//# sourceMappingURL=product-management.controller.js.map