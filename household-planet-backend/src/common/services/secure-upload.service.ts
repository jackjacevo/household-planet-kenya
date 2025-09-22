import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, resolve, basename, extname } from 'path';
import { randomUUID } from 'crypto';
import { AppLogger } from './logger.service';

@Injectable()
export class SecureUploadService {
  private readonly logger = new AppLogger(SecureUploadService.name);
  private readonly uploadPath = './uploads';
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.svg', '.ico', '.avif', '.heic', '.heif'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      console.log('🔍 SecureUploadService.uploadFile called with:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        folder: folder
      });
      
      this.validateFile(file);
      
      const uploadDir = join(this.uploadPath, this.sanitizeFolder(folder));
      console.log('📁 Upload directory:', uploadDir);
      
      await this.ensureDirectory(uploadDir);
      
      const filename = this.generateSecureFilename(file.originalname);
      const filepath = resolve(uploadDir, filename);
      console.log('📄 File path:', filepath);
      
      this.validatePath(filepath, uploadDir);
      
      console.log('💾 Writing file...');
      await fs.writeFile(filepath, file.buffer);
      console.log('✅ File written successfully');
      
      const publicPath = `/uploads/${folder}/${filename}`;
      this.logger.logFileOperation('upload', filename, true);
      
      console.log('🎯 Returning public path:', publicPath);
      return publicPath;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      this.logger.error(`Upload failed for ${file?.originalname}: ${error.message}`, error.stack);
      this.logger.logFileOperation('upload', file?.originalname || 'unknown', false);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty or corrupted');
    }
    
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large: ${file.size} bytes (max: ${this.maxFileSize})`);
    }
    
    const ext = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException(`Invalid file type: ${ext}`);
    }
    
    // Check for valid image headers
    if (!this.isValidImageBuffer(file.buffer)) {
      throw new BadRequestException('File is not a valid image');
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

  private isValidImageBuffer(buffer: Buffer): boolean {
    // Check for common image file signatures (magic numbers)
    const signatures = {
      jpg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
      gif: [0x47, 0x49, 0x46, 0x38],
      webp: [0x52, 0x49, 0x46, 0x46],
      bmp: [0x42, 0x4D],
      tiff1: [0x49, 0x49, 0x2A, 0x00],
      tiff2: [0x4D, 0x4D, 0x00, 0x2A],
      svg: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // <?xml
      ico: [0x00, 0x00, 0x01, 0x00]
    };

    // Check all signatures
    for (const [format, signature] of Object.entries(signatures)) {
      if (this.checkSignature(buffer, signature)) return true;
    }

    // Additional check for SVG (can start with <svg)
    const svgStart = Buffer.from('<svg', 'utf8');
    if (buffer.length >= 4 && buffer.subarray(0, 4).equals(svgStart)) return true;

    return false;
  }

  private checkSignature(buffer: Buffer, signature: number[]): boolean {
    if (buffer.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      // Skip wildcard bytes (0x00 in signature means any byte is acceptable)
      if (signature[i] !== 0x00 && buffer[i] !== signature[i]) {
        return false;
      }
    }
    
    return true;
  }
}
