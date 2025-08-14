import { Request } from 'express';
export declare class SecurityValidationService {
    validateHttpsInProduction(req: Request): boolean;
    validateCsrfToken(req: Request): boolean;
    sanitizeHeaders(headers: any): any;
    isSecureEndpoint(url: string): boolean;
}
