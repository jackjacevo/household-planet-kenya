export declare class VirusScanService {
    private readonly logger;
    private readonly clamAvEnabled;
    scanFile(filePath: string): Promise<boolean>;
    private scanForSuspiciousPatterns;
    private isClamAvAvailable;
    private scanWithClamAV;
    quarantineFile(filePath: string): Promise<void>;
}
