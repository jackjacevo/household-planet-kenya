import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { join, resolve, relative } from 'path';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { InputSanitizerService } from '../security/input-sanitizer.service';

@Injectable()
export class SecureFileStorageService {
  private readonly logger = new Logger(SecureFileStorageService.name);
  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';
  private readonly maxStoragePerUser = 100 * 1024 * 1024; // 100MB per user
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];

  constructor(private readonly sanitizer: InputSanitizerService) {}

  async storeFile(
    file: Express.Multer.File,
    userId: string,
    category: string = 'general'
  ): Promise<{
    path: string;
    url: string;
    hash: string;
    size: number;
  }> {
    try {
      // Validate file
      this.validateFile(file);
      
      // Check user storage quota
      await this.checkStorageQuota(userId);

      // Sanitize inputs
      const sanitizedUserId = this.sanitizer.sanitizeForDatabase(userId);
      const sanitizedCategory = this.sanitizer.sanitizeForDatabase(category);
      const sanitizedFilename = this.sanitizer.sanitizeFilename(file.originalname);

      // Generate secure filename
      const hash = this.generateFileHash(file.buffer);
      const extension = this.getFileExtension(sanitizedFilename);
      const filename = `${hash}${extension}`;
      
      // Create secure directory structure
      const userDir = this.createSecurePath(sanitizedUserId, sanitizedCategory);
      await this.ensureDirectoryExists(userDir);
      
      const filePath = join(userDir, filename);
      
      // Validate the final path is within allowed directory
      this.validatePath(filePath);
      
      const publicUrl = `/uploads/${sanitizedUserId}/${sanitizedCategory}/${filename}`;

      // Write file with restricted permissions
      await fs.writeFile(filePath, file.buffer, { mode: 0o644 });

      this.logger.log(`File stored securely: ${filePath}`);

      return {
        path: filePath,
        url: publicUrl,
        hash,
        size: file.size
      };
    } catch (error) {
      this.logger.error(`Secure file storage failed:`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string, userId: string): Promise<void> {
    try {
      // Validate the path belongs to the user and is within allowed directory
      this.validateUserFilePath(filePath, userId);
      
      await fs.unlink(filePath);
      this.logger.log(`File deleted securely: ${filePath}`);
    } catch (error) {
      this.logger.error(`Secure file deletion failed:`, error);
      throw error;
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large. Maximum size is 10MB');
    }

    // Check file extension
    const extension = this.getFileExtension(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new BadRequestException(`File type not allowed. Allowed types: ${this.allowedExtensions.join(', ')}`);
    }

    // Check MIME type matches extension
    if (!this.validateMimeType(file.mimetype, extension)) {
      throw new BadRequestException('File type mismatch');
    }
  }

  private validateMimeType(mimeType: string, extension: string): boolean {
    const mimeTypeMap: { [key: string]: string[] } = {
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

  private createSecurePath(userId: string, category: string): string {
    // Create path with normalized components
    const normalizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
    const normalizedCategory = category.replace(/[^a-zA-Z0-9-]/g, '');
    
    return join(this.uploadPath, normalizedUserId, normalizedCategory);
  }

  private validatePath(filePath: string): void {
    // Resolve the absolute path
    const absolutePath = resolve(filePath);
    const absoluteUploadPath = resolve(this.uploadPath);
    
    // Check if the file path is within the upload directory
    const relativePath = relative(absoluteUploadPath, absolutePath);
    
    if (relativePath.startsWith('..') || relativePath.includes('..')) {
      throw new BadRequestException('Invalid file path - path traversal detected');
    }
  }

  private validateUserFilePath(filePath: string, userId: string): void {
    const sanitizedUserId = this.sanitizer.sanitizeForDatabase(userId);
    const userPath = join(this.uploadPath, sanitizedUserId);
    const absoluteFilePath = resolve(filePath);
    const absoluteUserPath = resolve(userPath);
    
    const relativePath = relative(absoluteUserPath, absoluteFilePath);
    
    if (relativePath.startsWith('..') || relativePath.includes('..')) {
      throw new BadRequestException('Access denied - file does not belong to user');
    }
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex').substring(0, 16);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
    }
  }

  private async checkStorageQuota(userId: string): Promise<void> {
    const currentUsage = await this.getUserStorageUsage(userId);
    if (currentUsage >= this.maxStoragePerUser) {
      throw new BadRequestException(`Storage quota exceeded for user ${userId}`);
    }
  }

  private async getUserStorageUsage(userId: string): Promise<number> {
    try {
      const sanitizedUserId = this.sanitizer.sanitizeForDatabase(userId);
      const userDir = join(this.uploadPath, sanitizedUserId);
      return await this.getDirectorySize(userDir);
    } catch {
      return 0;
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      let totalSize = 0;

      for (const file of files) {
        const filePath = join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch {
      return 0;
    }
  }
}