import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';
  private readonly maxStoragePerUser = 100 * 1024 * 1024; // 100MB per user

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
      // Check user storage quota
      await this.checkStorageQuota(userId);

      // Generate secure filename
      const hash = this.generateFileHash(file.buffer);
      const extension = file.originalname.split('.').pop();
      const filename = `${hash}.${extension}`;
      
      // Create directory structure
      const userDir = join(this.uploadPath, userId, category);
      await this.ensureDirectoryExists(userDir);
      
      const filePath = join(userDir, filename);
      const publicUrl = `/uploads/${userId}/${category}/${filename}`;

      // Write file with restricted permissions
      await fs.writeFile(filePath, file.buffer, { mode: 0o644 });

      this.logger.log(`File stored: ${filePath}`);

      return {
        path: filePath,
        url: publicUrl,
        hash,
        size: file.size
      };
    } catch (error) {
      this.logger.error(`File storage failed:`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.error(`File deletion failed:`, error);
      throw error;
    }
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    try {
      const userDir = join(this.uploadPath, userId);
      return await this.getDirectorySize(userDir);
    } catch {
      return 0;
    }
  }

  private async checkStorageQuota(userId: string): Promise<void> {
    const currentUsage = await this.getUserStorageUsage(userId);
    if (currentUsage >= this.maxStoragePerUser) {
      throw new Error(`Storage quota exceeded for user ${userId}`);
    }
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

  async cleanupTempFiles(): Promise<void> {
    const tempDir = join(this.uploadPath, 'temp');
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          this.logger.log(`Cleaned up temp file: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Temp file cleanup failed:`, error);
    }
  }
}