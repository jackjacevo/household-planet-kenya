export declare class CsrfProtectionService {
    private readonly tokenStore;
    private readonly tokenExpiry;
    generateToken(sessionId: string): string;
    validateToken(sessionId: string, providedToken: string): boolean;
    removeToken(sessionId: string): void;
    generateDoubleSubmitToken(): string;
    validateDoubleSubmitToken(cookieToken: string, headerToken: string): boolean;
    hashToken(token: string): string;
    private constantTimeCompare;
    private cleanupExpiredTokens;
    getTokenInfo(sessionId: string): {
        exists: boolean;
        expires?: number;
    };
}
