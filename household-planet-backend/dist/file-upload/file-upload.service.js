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
var FileUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const file_validation_service_1 = require("./file-validation.service");
const file_storage_service_1 = require("./file-storage.service");
const virus_scan_service_1 = require("./virus-scan.service");
const image_optimization_service_1 = require("./image-optimization.service");
const prisma_service_1 = require("../prisma/prisma.service");
let FileUploadService = FileUploadService_1 = class FileUploadService {
    constructor(fileValidation, fileStorage, virusScan, imageOptimization, prisma) {
        this.fileValidation = fileValidation;
        this.fileStorage = fileStorage;
        this.virusScan = virusScan;
        this.imageOptimization = imageOptimization;
        this.prisma = prisma;
        this.logger = new common_1.Logger(FileUploadService_1.name);
    }
    async uploadFile(file, userId, category = 'general', allowedTypes) {
        try {
            await this.fileValidation.validateFile(file, allowedTypes);
            const isClean = await this.virusScan.scanFile(file.path);
            if (!isClean) {
                await this.virusScan.quarantineFile(file.path);
                throw new common_1.BadRequestException('File failed security scan');
            }
            const storedFile = await this.fileStorage.storeFile(file, userId, category);
            let optimizedUrl = storedFile.url;
            if (file.mimetype.startsWith('image/')) {
                const optimizedPath = storedFile.path.replace(/\.[^.]+$/, '_optimized.webp');
                await this.imageOptimization.optimizeImage(storedFile.path, optimizedPath);
                optimizedUrl = storedFile.url.replace(/\.[^.]+$/, '_optimized.webp');
            }
            const fileRecord = await this.prisma.uploadedFile.create({
                data: {
                    originalName: this.fileValidation.sanitizeFilename(file.originalname),
                    filename: storedFile.path.split('/').pop() || '',
                    path: storedFile.path,
                    url: optimizedUrl,
                    mimeType: file.mimetype,
                    size: file.size,
                    hash: storedFile.hash,
                    category,
                    userId,
                    uploadedAt: new Date(),
                },
            });
            this.logger.log(`File uploaded successfully: ${fileRecord.id}`);
            return {
                id: fileRecord.id,
                url: fileRecord.url,
                originalName: fileRecord.originalName,
                size: fileRecord.size,
                mimeType: fileRecord.mimeType,
            };
        }
        catch (error) {
            this.logger.error(`File upload failed:`, error);
            throw error;
        }
    }
    async deleteFile(fileId, userId) {
        const file = await this.prisma.uploadedFile.findFirst({
            where: { id: fileId, userId },
        });
        if (!file) {
            throw new common_1.BadRequestException('File not found or access denied');
        }
        await this.fileStorage.deleteFile(file.path);
        await this.prisma.uploadedFile.delete({ where: { id: fileId } });
        this.logger.log(`File deleted: ${fileId}`);
    }
    async getUserFiles(userId, category) {
        return this.prisma.uploadedFile.findMany({
            where: {
                userId,
                ...(category && { category }),
            },
            select: {
                id: true,
                originalName: true,
                url: true,
                mimeType: true,
                size: true,
                category: true,
                uploadedAt: true,
            },
            orderBy: { uploadedAt: 'desc' },
        });
    }
    async getFileById(fileId, userId) {
        const file = await this.prisma.uploadedFile.findFirst({
            where: { id: fileId, userId },
        });
        if (!file) {
            throw new common_1.BadRequestException('File not found or access denied');
        }
        return file;
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = FileUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [file_validation_service_1.FileValidationService,
        file_storage_service_1.FileStorageService,
        virus_scan_service_1.VirusScanService,
        image_optimization_service_1.ImageOptimizationService,
        prisma_service_1.PrismaService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map