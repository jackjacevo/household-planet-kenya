import { Injectable, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import * as mime from 'mime-types';

@Injectable()
export class FileValidationService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly allowedDocumentTypes = ['application/pdf', 'text/plain'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxImageSize = 5 * 1024 * 1024; // 5MB

  async validateFile(file: Express.Multer.File, allowedTypes?: string[]): Promise<boolean> {
    // File size validation
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds maximum limit of 10MB');
    }

    // MIME type validation
    const detectedType = await this.detectFileType(file.buffer);
    if (!detectedType) {
      throw new BadRequestException('Unable to determine file type');
    }

    const allowedMimeTypes = allowedTypes || [...this.allowedImageTypes, ...this.allowedDocumentTypes];
    if (!allowedMimeTypes.includes(detectedType.mime)) {
      throw new BadRequestException(`File type ${detectedType.mime} is not allowed`);
    }

    // Additional image validation
    if (this.allowedImageTypes.includes(detectedType.mime)) {
      return this.validateImage(file);
    }

    return true;
  }

  private async detectFileType(buffer: Buffer) {
    return await fileTypeFromBuffer(buffer);
  }

  private validateImage(file: Express.Multer.File): boolean {
    if (file.size > this.maxImageSize) {
      throw new BadRequestException('Image size exceeds maximum limit of 5MB');
    }

    // Check for malicious content in filename
    if (this.containsMaliciousContent(file.originalname)) {
      throw new BadRequestException('Filename contains potentially malicious content');
    }

    return true;
  }

  private containsMaliciousContent(filename: string): boolean {
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

  validateFileQuota(userId: string, currentFileCount: number, maxFiles: number = 100): boolean {
    if (currentFileCount >= maxFiles) {
      throw new BadRequestException(`File quota exceeded. Maximum ${maxFiles} files allowed per user`);
    }
    return true;
  }

  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }
}