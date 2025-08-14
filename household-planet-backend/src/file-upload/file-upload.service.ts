import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FileValidationService } from './file-validation.service';
import { FileStorageService } from './file-storage.service';
import { VirusScanService } from './virus-scan.service';
import { ImageOptimizationService } from './image-optimization.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly fileValidation: FileValidationService,
    private readonly fileStorage: FileStorageService,
    private readonly virusScan: VirusScanService,
    private readonly imageOptimization: ImageOptimizationService,
    private readonly prisma: PrismaService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    category: string = 'general',
    allowedTypes?: string[]
  ): Promise<{
    id: string;
    url: string;
    originalName: string;
    size: number;
    mimeType: string;
  }> {
    try {
      // Validate file
      await this.fileValidation.validateFile(file, allowedTypes);

      // Scan for viruses
      const isClean = await this.virusScan.scanFile(file.path);
      if (!isClean) {
        await this.virusScan.quarantineFile(file.path);
        throw new BadRequestException('File failed security scan');
      }

      // Store file securely
      const storedFile = await this.fileStorage.storeFile(file, userId, category);

      // Optimize images if applicable
      let optimizedUrl = storedFile.url;
      if (file.mimetype.startsWith('image/')) {
        const optimizedPath = storedFile.path.replace(/\.[^.]+$/, '_optimized.webp');
        await this.imageOptimization.optimizeImage(storedFile.path, optimizedPath);
        optimizedUrl = storedFile.url.replace(/\.[^.]+$/, '_optimized.webp');
      }

      // Save to database
      const fileRecord = await this.prisma.uploadedFile.create({
        data: {
          originalName: this.fileValidation.sanitizeFilename(file.originalname),
          filename: storedFile.path.split('/').pop() || '',
          path: storedFile.path,
          url: optimizedUrl,
          mimeType: file.mimetype,
          size: file.size,
          hash: storedFile.hash,
          category,
          userId,
          uploadedAt: new Date(),
        },
      });

      this.logger.log(`File uploaded successfully: ${fileRecord.id}`);

      return {
        id: fileRecord.id,
        url: fileRecord.url,
        originalName: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
      };
    } catch (error) {
      this.logger.error(`File upload failed:`, error);
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.prisma.uploadedFile.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new BadRequestException('File not found or access denied');
    }

    await this.fileStorage.deleteFile(file.path);
    await this.prisma.uploadedFile.delete({ where: { id: fileId } });

    this.logger.log(`File deleted: ${fileId}`);
  }

  async getUserFiles(userId: string, category?: string): Promise<any[]> {
    return this.prisma.uploadedFile.findMany({
      where: {
        userId,
        ...(category && { category }),
      },
      select: {
        id: true,
        originalName: true,
        url: true,
        mimeType: true,
        size: true,
        category: true,
        uploadedAt: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getFileById(fileId: string, userId: string): Promise<any> {
    const file = await this.prisma.uploadedFile.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new BadRequestException('File not found or access denied');
    }

    return file;
  }
}