export declare class FileStorageService {
    private readonly logger;
    private readonly uploadPath;
    private readonly maxStoragePerUser;
    storeFile(file: Express.Multer.File, userId: string, category?: string): Promise<{
        path: string;
        url: string;
        hash: string;
        size: number;
    }>;
    deleteFile(filePath: string): Promise<void>;
    getUserStorageUsage(userId: string): Promise<number>;
    private checkStorageQuota;
    private generateFileHash;
    private ensureDirectoryExists;
    private getDirectorySize;
    cleanupTempFiles(): Promise<void>;
}
