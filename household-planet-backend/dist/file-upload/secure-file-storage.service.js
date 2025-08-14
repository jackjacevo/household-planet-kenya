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
var SecureFileStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureFileStorageService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const input_sanitizer_service_1 = require("../security/input-sanitizer.service");
let SecureFileStorageService = SecureFileStorageService_1 = class SecureFileStorageService {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.logger = new common_1.Logger(SecureFileStorageService_1.name);
        this.uploadPath = process.env.UPLOAD_PATH || './uploads';
        this.maxStoragePerUser = 100 * 1024 * 1024;
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    }
    async storeFile(file, userId, category = 'general') {
        try {
            this.validateFile(file);
            await this.checkStorageQuota(userId);
            const sanitizedUserId = this.sanitizer.sanitizeForDatabase(userId);
            const sanitizedCategory = this.sanitizer.sanitizeForDatabase(category);
            const sanitizedFilename = this.sanitizer.sanitizeFilename(file.originalname);
            const hash = this.generateFileHash(file.buffer);
            const extension = this.getFileExtension(sanitizedFilename);
            const filename = `${hash}${extension}`;
            const userDir = this.createSecurePath(sanitizedUserId, sanitizedCategory);
            await this.ensureDirectoryExists(userDir);
            const filePath = (0, path_1.join)(userDir, filename);
            this.validatePath(filePath);
            const publicUrl = `/uploads/${sanitizedUserId}/${sanitizedCategory}/${filename}`;
            await fs_1.promises.writeFile(filePath, file.buffer, { mode: 0o644 });
            this.logger.log(`File stored securely: ${filePath}`);
            return {
                path: filePath,
                url: publicUrl,
                hash,
                size: file.size
            };
        }
        catch (error) {
            this.logger.error(`Secure file storage failed:`, error);
            throw error;
        }
    }
    async deleteFile(filePath, userId) {
        try {
            this.validateUserFilePath(filePath, userId);
            await fs_1.promises.unlink(filePath);
            this.logger.log(`File deleted securely: ${filePath}`);
        }
        catch (error) {
            this.logger.error(`Secure file deletion failed:`, error);
            throw error;
        }
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException('File too large. Maximum size is 10MB');
        }
        const extension = this.getFileExtension(file.originalname).toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            throw new common_1.BadRequestException(`File type not allowed. Allowed types: ${this.allowedExtensions.join(', ')}`);
        }
        if (!this.validateMimeType(file.mimetype, extension)) {
            throw new common_1.BadRequestException('File type mismatch');
        }
    }
    validateMimeType(mimeType, extension) {
        const mimeTypeMap = {
            '.jpg': ['image/jpeg'],
            '.jpeg': ['image/jpeg'],
            '.png': ['image/png'],
            '.gif': ['image/gif'],
            '.pdf': ['application/pdf'],
            '.doc': ['application/msword'],
            '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        };
        const allowedMimeTypes = mimeTypeMap[extension];
        return allowedMimeTypes ? allowedMimeTypes.includes(mimeType) : false;
    }
    createSecurePath(userId, category) {
        const normalizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
        const normalizedCategory = category.replace(/[^a-zA-Z0-9-]/g, '');
        return (0, path_1.join)(this.uploadPath, normalizedUserId, normalizedCategory);
    }
    validatePath(filePath) {
        const absolutePath = (0, path_1.resolve)(filePath);
        const absoluteUploadPath = (0, path_1.resolve)(this.uploadPath);
        const relativePath = (0, path_1.relative)(absoluteUploadPath, absolutePath);
        if (relativePath.startsWith('..') || relativePath.includes('..')) {
            throw new common_1.BadRequestException('Invalid file path - path traversal detected');
        }
    }
    validateUserFilePath(filePath, userId) {
        const sanitizedUserId = this.sanitizer.sanitizeForDatabase(userId);
        const userPath = (0, path_1.join)(this.uploadPath, sanitizedUserId);
        const absoluteFilePath = (0, path_1.resolve)(filePath);
        const absoluteUserPath = (0, path_1.resolve)(userPath);
        const relativePath = (0, path_1.relative)(absoluteUserPath, absoluteFilePath);
        if (relativePath.startsWith('..') || relativePath.includes('..')) {
            throw new common_1.BadRequestException('Access denied - file does not belong to user');
        }
    }
    getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
    }
    generateFileHash(buffer) {
        return (0, crypto_1.createHash)('sha256').update(buffer).digest('hex').substring(0, 16);
    }
    async ensureDirectoryExists(dirPath) {
        try {
            await fs_1.promises.access(dirPath);
        }
        catch {
            await fs_1.promises.mkdir(dirPath, { recursive: true, mode: 0o755 });
        }
    }
    async checkStorageQuota(userId) {
        const currentUsage = await this.getUserStorageUsage(userId);
        if (currentUsage >= this.maxStoragePerUser) {
            throw new common_1.BadRequestException(`Storage quota exceeded for user ${userId}`);
        }
    }
    async getUserStorageUsage(userId) {
        try {
            const sanitizedUserId = this.sanitizer.sanitizeForDatabase(userId);
            const userDir = (0, path_1.join)(this.uploadPath, sanitizedUserId);
            return await this.getDirectorySize(userDir);
        }
        catch {
            return 0;
        }
    }
    async getDirectorySize(dirPath) {
        try {
            const files = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
            let totalSize = 0;
            for (const file of files) {
                const filePath = (0, path_1.join)(dirPath, file.name);
                if (file.isDirectory()) {
                    totalSize += await this.getDirectorySize(filePath);
                }
                else {
                    const stats = await fs_1.promises.stat(filePath);
                    totalSize += stats.size;
                }
            }
            return totalSize;
        }
        catch {
            return 0;
        }
    }
};
exports.SecureFileStorageService = SecureFileStorageService;
exports.SecureFileStorageService = SecureFileStorageService = SecureFileStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [input_sanitizer_service_1.InputSanitizerService])
], SecureFileStorageService);
//# sourceMappingURL=secure-file-storage.service.js.map