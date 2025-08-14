export declare class ApiLoggingService {
    private readonly logger;
    private readonly securityLogger;
    private readonly logSanitizer;
    constructor();
    logRequest(req: any, res: any, responseTime: number): void;
    logSecurityEvent(event: string, details: any, severity?: 'low' | 'medium' | 'high'): void;
    logAuthAttempt(success: boolean, email: string, ip: string, userAgent: string): void;
    logRateLimitExceeded(ip: string, endpoint: string, limit: number): void;
    logSuspiciousActivity(type: string, details: any): void;
    logFileUpload(userId: string, filename: string, size: number, mimeType: string, success: boolean): void;
    logDataAccess(userId: string, resource: string, action: string): void;
}
