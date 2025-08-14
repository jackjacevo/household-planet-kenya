"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidationService = void 0;
const common_1 = require("@nestjs/common");
const file_type_1 = require("file-type");
let FileValidationService = class FileValidationService {
    constructor() {
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        this.allowedDocumentTypes = ['application/pdf', 'text/plain'];
        this.maxFileSize = 10 * 1024 * 1024;
        this.maxImageSize = 5 * 1024 * 1024;
    }
    async validateFile(file, allowedTypes) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('File size exceeds maximum limit of 10MB');
        }
        const detectedType = await this.detectFileType(file.buffer);
        if (!detectedType) {
            throw new common_1.BadRequestException('Unable to determine file type');
        }
        const allowedMimeTypes = allowedTypes || [...this.allowedImageTypes, ...this.allowedDocumentTypes];
        if (!allowedMimeTypes.includes(detectedType.mime)) {
            throw new common_1.BadRequestException(`File type ${detectedType.mime} is not allowed`);
        }
        if (this.allowedImageTypes.includes(detectedType.mime)) {
            return this.validateImage(file);
        }
        return true;
    }
    async detectFileType(buffer) {
        return await (0, file_type_1.fileTypeFromBuffer)(buffer);
    }
    validateImage(file) {
        if (file.size > this.maxImageSize) {
            throw new common_1.BadRequestException('Image size exceeds maximum limit of 5MB');
        }
        if (this.containsMaliciousContent(file.originalname)) {
            throw new common_1.BadRequestException('Filename contains potentially malicious content');
        }
        return true;
    }
    containsMaliciousContent(filename) {
        const maliciousPatterns = [
            /\.php$/i,
            /\.jsp$/i,
            /\.asp$/i,
            /\.exe$/i,
            /\.bat$/i,
            /\.cmd$/i,
            /\.scr$/i,
            /\.vbs$/i,
            /\.js$/i,
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
        ];
        return maliciousPatterns.some(pattern => pattern.test(filename));
    }
    validateFileQuota(userId, currentFileCount, maxFiles = 100) {
        if (currentFileCount >= maxFiles) {
            throw new common_1.BadRequestException(`File quota exceeded. Maximum ${maxFiles} files allowed per user`);
        }
        return true;
    }
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase();
    }
};
exports.FileValidationService = FileValidationService;
exports.FileValidationService = FileValidationService = __decorate([
    (0, common_1.Injectable)()
], FileValidationService);
//# sourceMappingURL=file-validation.service.js.map