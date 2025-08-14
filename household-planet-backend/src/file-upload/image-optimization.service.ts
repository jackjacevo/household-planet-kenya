import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import { join } from 'path';

@Injectable()
export class ImageOptimizationService {
  private readonly logger = new Logger(ImageOptimizationService.name);

  async optimizeImage(inputPath: string, outputPath: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<string> {
    try {
      const {
        width = 1200,
        height = 1200,
        quality = 80,
        format = 'webp'
      } = options || {};

      await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

      this.logger.log(`Image optimized: ${inputPath} -> ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error(`Image optimization failed:`, error);
      throw error;
    }
  }

  async createThumbnail(inputPath: string, outputPath: string, size: number = 300): Promise<string> {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat('webp', { quality: 70 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      this.logger.error(`Thumbnail creation failed:`, error);
      throw error;
    }
  }

  async generateMultipleSizes(inputPath: string, basePath: string): Promise<{
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  }> {
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
      results[sizeName as keyof typeof results] = outputPath;
    }

    return results;
  }

  async stripMetadata(inputPath: string, outputPath: string): Promise<void> {
    try {
      await sharp(inputPath)
        .rotate() // Auto-rotate based on EXIF
        .withMetadata({}) // Strip all metadata
        .toFile(outputPath);
    } catch (error) {
      this.logger.error(`Metadata stripping failed:`, error);
      throw error;
    }
  }
}