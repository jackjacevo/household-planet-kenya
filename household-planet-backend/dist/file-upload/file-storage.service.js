"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
let FileStorageService = FileStorageService_1 = class FileStorageService {
    constructor() {
        this.logger = new common_1.Logger(FileStorageService_1.name);
        this.uploadPath = process.env.UPLOAD_PATH || './uploads';
        this.maxStoragePerUser = 100 * 1024 * 1024;
    }
    async storeFile(file, userId, category = 'general') {
        try {
            await this.checkStorageQuota(userId);
            const hash = this.generateFileHash(file.buffer);
            const extension = file.originalname.split('.').pop();
            const filename = `${hash}.${extension}`;
            const userDir = (0, path_1.join)(this.uploadPath, userId, category);
            await this.ensureDirectoryExists(userDir);
            const filePath = (0, path_1.join)(userDir, filename);
            const publicUrl = `/uploads/${userId}/${category}/${filename}`;
            await fs_1.promises.writeFile(filePath, file.buffer, { mode: 0o644 });
            this.logger.log(`File stored: ${filePath}`);
            return {
                path: filePath,
                url: publicUrl,
                hash,
                size: file.size
            };
        }
        catch (error) {
            this.logger.error(`File storage failed:`, error);
            throw error;
        }
    }
    async deleteFile(filePath) {
        try {
            await fs_1.promises.unlink(filePath);
            this.logger.log(`File deleted: ${filePath}`);
        }
        catch (error) {
            this.logger.error(`File deletion failed:`, error);
            throw error;
        }
    }
    async getUserStorageUsage(userId) {
        try {
            const userDir = (0, path_1.join)(this.uploadPath, userId);
            return await this.getDirectorySize(userDir);
        }
        catch {
            return 0;
        }
    }
    async checkStorageQuota(userId) {
        const currentUsage = await this.getUserStorageUsage(userId);
        if (currentUsage >= this.maxStoragePerUser) {
            throw new Error(`Storage quota exceeded for user ${userId}`);
        }
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
    async cleanupTempFiles() {
        const tempDir = (0, path_1.join)(this.uploadPath, 'temp');
        try {
            const files = await fs_1.promises.readdir(tempDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000;
            for (const file of files) {
                const filePath = (0, path_1.join)(tempDir, file);
                const stats = await fs_1.promises.stat(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs_1.promises.unlink(filePath);
                    this.logger.log(`Cleaned up temp file: ${filePath}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Temp file cleanup failed:`, error);
        }
    }
};
exports.FileStorageService = FileStorageService;
exports.FileStorageService = FileStorageService = FileStorageService_1 = __decorate([
    (0, common_1.Injectable)()
], FileStorageService);
//# sourceMappingURL=file-storage.service.js.map