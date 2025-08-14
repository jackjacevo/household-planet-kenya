import { InputSanitizerService } from '../security/input-sanitizer.service';
export declare class SecureFileStorageService {
    private readonly sanitizer;
    private readonly logger;
    private readonly uploadPath;
    private readonly maxStoragePerUser;
    private readonly allowedExtensions;
    constructor(sanitizer: InputSanitizerService);
    storeFile(file: Express.Multer.File, userId: string, category?: string): Promise<{
        path: string;
        url: string;
        hash: string;
        size: number;
    }>;
    deleteFile(filePath: string, userId: string): Promise<void>;
    private validateFile;
    private validateMimeType;
    private createSecurePath;
    private validatePath;
    private validateUserFilePath;
    private getFileExtension;
    private generateFileHash;
    private ensureDirectoryExists;
    private checkStorageQuota;
    private getUserStorageUsage;
    private getDirectorySize;
}
