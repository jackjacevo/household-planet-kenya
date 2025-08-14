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
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const file_upload_service_1 = require("./file-upload.service");
const rate_limit_decorator_1 = require("../security/decorators/rate-limit.decorator");
let FileUploadController = class FileUploadController {
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadFile(file, req, category, allowedTypes) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const allowedTypesArray = allowedTypes ? allowedTypes.split(',') : undefined;
        return this.fileUploadService.uploadFile(file, req.user.id, category || 'general', allowedTypesArray);
    }
    async uploadMultipleFiles(files, req, category, allowedTypes) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const allowedTypesArray = allowedTypes ? allowedTypes.split(',') : undefined;
        const results = [];
        for (const file of files) {
            const result = await this.fileUploadService.uploadFile(file, req.user.id, category || 'general', allowedTypesArray);
            results.push(result);
        }
        return { files: results };
    }
    async getUserFiles(req, category) {
        return this.fileUploadService.getUserFiles(req.user.id, category);
    }
    async getFile(id, req) {
        return this.fileUploadService.getFileById(id, req.user.id);
    }
    async deleteFile(id, req) {
        await this.fileUploadService.deleteFile(id, req.user.id);
        return { message: 'File deleted successfully' };
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, rate_limit_decorator_1.RateLimit)({ ttl: 60000, limit: 10 }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('allowedTypes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, rate_limit_decorator_1.RateLimit)({ ttl: 60000, limit: 5 }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('allowedTypes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getUserFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, rate_limit_decorator_1.RateLimit)({ ttl: 60000, limit: 20 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map