import { FileUploadService } from './file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadFile(file: Express.Multer.File, req: any, category?: string, allowedTypes?: string): Promise<{
        id: string;
        url: string;
        originalName: string;
        size: number;
        mimeType: string;
    }>;
    uploadMultipleFiles(files: Express.Multer.File[], req: any, category?: string, allowedTypes?: string): Promise<{
        files: any[];
    }>;
    getUserFiles(req: any, category?: string): Promise<any[]>;
    getFile(id: string, req: any): Promise<any>;
    deleteFile(id: string, req: any): Promise<{
        message: string;
    }>;
}
