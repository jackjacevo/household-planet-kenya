import { FileValidationService } from './file-validation.service';
import { FileStorageService } from './file-storage.service';
import { VirusScanService } from './virus-scan.service';
import { ImageOptimizationService } from './image-optimization.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class FileUploadService {
    private readonly fileValidation;
    private readonly fileStorage;
    private readonly virusScan;
    private readonly imageOptimization;
    private readonly prisma;
    private readonly logger;
    constructor(fileValidation: FileValidationService, fileStorage: FileStorageService, virusScan: VirusScanService, imageOptimization: ImageOptimizationService, prisma: PrismaService);
    uploadFile(file: Express.Multer.File, userId: string, category?: string, allowedTypes?: string[]): Promise<{
        id: string;
        url: string;
        originalName: string;
        size: number;
        mimeType: string;
    }>;
    deleteFile(fileId: string, userId: string): Promise<void>;
    getUserFiles(userId: string, category?: string): Promise<any[]>;
    getFileById(fileId: string, userId: string): Promise<any>;
}
