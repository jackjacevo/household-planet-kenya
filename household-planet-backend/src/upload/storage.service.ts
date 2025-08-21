import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly uploadDir = './uploads';
  private readonly secureDir = './secure-uploads';

  async saveFile(file: Express.Multer.File, filename: string, userId: string): Promise<string> {
    const userDir = path.join(this.secureDir, userId);
    await this.ensureDirectoryExists(userDir);

    const filePath = path.join(userDir, filename);
    
    // Save file with restricted permissions
    await fs.writeFile(filePath, file.buffer, { mode: 0o600 });
    
    return filePath;
  }

  async optimizeImage(filePath: string): Promise<void> {
    if (!this.isImageFile(filePath)) return;

    const optimizedPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '_optimized.$1');
    
    await sharp(filePath)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Replace original with optimized
    await fs.rename(optimizedPath, filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  async getUserFileCount(userId: string): Promise<number> {
    const userDir = path.join(this.secureDir, userId);
    try {
      const files = await fs.readdir(userDir);
      return files.length;
    } catch {
      return 0;
    }
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    }
  }

  private isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  }

  getSecureUrl(filePath: string, userId: string): string {
    const filename = path.basename(filePath);
    return `/api/upload/secure/${userId}/${filename}`;
  }
}