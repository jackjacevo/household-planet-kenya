export declare class ValidationService {
    sanitizeInput(input: string): string;
    sanitizeHtml(html: string): string;
    validateEmail(email: string): boolean;
    validatePhone(phone: string): boolean;
    validatePassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    validateUrl(url: string): boolean;
    validateFileUpload(filename: string, mimeType: string, size: number): {
        isValid: boolean;
        errors: string[];
    };
    validateCreditCard(cardNumber: string): boolean;
    validateAmount(amount: number): boolean;
    validateDateRange(startDate: Date, endDate: Date): boolean;
    detectSQLInjection(input: string): boolean;
    detectXSS(input: string): boolean;
    private containsSuspiciousPatterns;
    private isCommonPassword;
}
