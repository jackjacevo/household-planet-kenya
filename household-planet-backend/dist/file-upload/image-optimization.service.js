"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImageOptimizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
let ImageOptimizationService = ImageOptimizationService_1 = class ImageOptimizationService {
    constructor() {
        this.logger = new common_1.Logger(ImageOptimizationService_1.name);
    }
    async optimizeImage(inputPath, outputPath, options) {
        try {
            const { width = 1200, height = 1200, quality = 80, format = 'webp' } = options || {};
            await sharp(inputPath)
                .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .toFormat(format, { quality })
                .toFile(outputPath);
            this.logger.log(`Image optimized: ${inputPath} -> ${outputPath}`);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`Image optimization failed:`, error);
            throw error;
        }
    }
    async createThumbnail(inputPath, outputPath, size = 300) {
        try {
            await sharp(inputPath)
                .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
                .toFormat('webp', { quality: 70 })
                .toFile(outputPath);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`Thumbnail creation failed:`, error);
            throw error;
        }
    }
    async generateMultipleSizes(inputPath, basePath) {
        const sizes = {
            large: { width: 1200, height: 1200, quality: 85 },
            medium: { width: 800, height: 800, quality: 80 },
            small: { width: 400, height: 400, quality: 75 },
            thumbnail: { width: 150, height: 150, quality: 70 }
        };
        const results = {
            original: inputPath,
            large: '',
            medium: '',
            small: '',
            thumbnail: ''
        };
        for (const [sizeName, config] of Object.entries(sizes)) {
            const outputPath = `${basePath}_${sizeName}.webp`;
            await this.optimizeImage(inputPath, outputPath, {
                ...config,
                format: 'webp'
            });
            results[sizeName] = outputPath;
        }
        return results;
    }
    async stripMetadata(inputPath, outputPath) {
        try {
            await sharp(inputPath)
                .rotate()
                .withMetadata({})
                .toFile(outputPath);
        }
        catch (error) {
            this.logger.error(`Metadata stripping failed:`, error);
            throw error;
        }
    }
};
exports.ImageOptimizationService = ImageOptimizationService;
exports.ImageOptimizationService = ImageOptimizationService = ImageOptimizationService_1 = __decorate([
    (0, common_1.Injectable)()
], ImageOptimizationService);
//# sourceMappingURL=image-optimization.service.js.map