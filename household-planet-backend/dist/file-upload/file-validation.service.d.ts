export declare class FileValidationService {
    private readonly allowedImageTypes;
    private readonly allowedDocumentTypes;
    private readonly maxFileSize;
    private readonly maxImageSize;
    validateFile(file: Express.Multer.File, allowedTypes?: string[]): Promise<boolean>;
    private detectFileType;
    private validateImage;
    private containsMaliciousContent;
    validateFileQuota(userId: string, currentFileCount: number, maxFiles?: number): boolean;
    sanitizeFilename(filename: string): string;
}
