export declare class ImageOptimizationService {
    private readonly logger;
    optimizeImage(inputPath: string, outputPath: string, options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
    }): Promise<string>;
    createThumbnail(inputPath: string, outputPath: string, size?: number): Promise<string>;
    generateMultipleSizes(inputPath: string, basePath: string): Promise<{
        original: string;
        large: string;
        medium: string;
        small: string;
        thumbnail: string;
    }>;
    stripMetadata(inputPath: string, outputPath: string): Promise<void>;
}
