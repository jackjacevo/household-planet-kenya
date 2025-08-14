import { InputSanitizerService } from './input-sanitizer.service';
export declare class SecureLoggerService {
    private readonly sanitizer;
    private readonly logger;
    constructor(sanitizer: InputSanitizerService);
    info(message: string, userInput?: any, context?: string): void;
    error(message: string, error?: any, userInput?: any, context?: string): void;
    warn(message: string, userInput?: any, context?: string): void;
    debug(message: string, userInput?: any, context?: string): void;
    security(event: string, details: any, userId?: string, ip?: string): void;
    auth(event: string, userId?: string, ip?: string, userAgent?: string): void;
    api(method: string, url: string, userId?: string, ip?: string, responseTime?: number): void;
    file(operation: string, filename: string, userId?: string, success?: boolean): void;
    database(operation: string, table: string, userId?: string, recordId?: string): void;
}
