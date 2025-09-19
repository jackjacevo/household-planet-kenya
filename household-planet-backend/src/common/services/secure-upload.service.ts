import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, resolve, basename, extname } from 'path';
import { randomUUID } from 'crypto';
import { AppLogger } from './logger.service';

@Injectable()
export class SecureUploadService {
  private readonly logger = new AppLogger(SecureUploadService.name);
  private readonly uploadPath = './uploads';
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      this.validateFile(file);
      
      const uploadDir = join(this.uploadPath, this.sanitizeFolder(folder));
      await this.ensureDirectory(uploadDir);
      
      const filename = this.generateSecureFilename(file.originalname);
      const filepath = resolve(uploadDir, filename);
      
      this.validatePath(filepath, uploadDir);
      
      await fs.writeFile(filepath, file.buffer);
      
      const publicPath = `/uploads/${folder}/${filename}`;
      this.logger.logFileOperation('upload', filename, true);
      
      return publicPath;
    } catch (error) {
      this.logger.logFileOperation('upload', file.originalname, false);
      throw error;
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File too large');
    }
    
    const ext = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException('Invalid file type');
    }
  }

  private sanitizeFolder(folder: string): string {
    return folder.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  private generateSecureFilename(originalname: string): string {
    const ext = extname(originalname);
    return `${randomUUID()}${ext}`;
  }

  private validatePath(filepath: string, allowedDir: string): void {
    if (!filepath.startsWith(resolve(allowedDir))) {
      this.logger.logSecurityEvent('Path traversal attempt', { filepath, allowedDir });
      throw new BadRequestException('Invalid file path');
    }
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
