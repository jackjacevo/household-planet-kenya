export declare class LogSanitizerService {
    private readonly dangerousPatterns;
    private readonly maxLength;
    private readonly sensitiveFields;
    sanitizeForLog(input: any): string;
    sanitizeObject(obj: any, depth?: number): any;
    sanitizeUserInput(input: string): string;
    private isSensitiveField;
    sanitizeError(error: any): any;
    sanitizeRequest(req: any): any;
}
