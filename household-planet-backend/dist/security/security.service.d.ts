export declare class SecurityService {
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    generateSecureToken(length?: number): string;
    generateSecurePassword(length?: number): string;
    hashSensitiveData(data: string): string;
    verifyHash(data: string, hash: string): boolean;
    generateCSRFToken(): string;
    validateCSRFToken(token: string, sessionToken: string): boolean;
    sanitizeInput(input: string): string;
    isValidEmail(email: string): boolean;
    isValidPhone(phone: string): boolean;
    checkPasswordStrength(password: string): {
        score: number;
        feedback: string[];
    };
    detectSQLInjection(input: string): boolean;
    detectXSS(input: string): boolean;
    logSecurityEvent(event: string, details: any, userId?: string): void;
    private getEventSeverity;
}
