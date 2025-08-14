export declare class InputSanitizerService {
    sanitizeForDatabase(input: any): any;
    sanitizeForLogging(input: string): string;
    sanitizeHtml(input: string): string;
    sanitizeFilename(filename: string): string;
    sanitizeSearchQuery(query: string): string;
    sanitizeUserInput(input: any): any;
    private isValidKey;
    encodeForUrl(input: string): string;
    sanitizePhoneNumber(phone: string): string;
    sanitizeEmail(email: string): string;
}
