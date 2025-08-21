import { Injectable, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import * as crypto from 'crypto';

@Injectable()
export class FileValidationService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
  ];

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxFilesPerUser = 100;

  async validateFile(file: Express.Multer.File): Promise<void> {
    // File size validation
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // File type validation using magic numbers
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (!detectedType || !this.allowedMimeTypes.includes(detectedType.mime)) {
      throw new BadRequestException('Invalid file type');
    }

    // Additional MIME type check
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid MIME type');
    }

    // Basic virus scan (check for suspicious patterns)
    await this.basicVirusScan(file.buffer);
  }

  private async basicVirusScan(buffer: Buffer): Promise<void> {
    const suspiciousPatterns = [
      /X5O!P%@AP\[4\\PZX54\(P\^\)7CC\)7\}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H\+H\*/,
      /<script/gi,
      /javascript:/gi,
      /vbscript:/gi,
    ];

    const content = buffer.toString('utf8');
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        throw new BadRequestException('File contains suspicious content');
      }
    }
  }

  generateSecureFilename(originalName: string): string {
    const ext = originalName.split('.').pop();
    const hash = crypto.randomBytes(16).toString('hex');
    return `${hash}.${ext}`;
  }

  validateUserQuota(userId: string, currentFileCount: number): void {
    if (currentFileCount >= this.maxFilesPerUser) {
      throw new BadRequestException('File upload quota exceeded');
    }
  }
}