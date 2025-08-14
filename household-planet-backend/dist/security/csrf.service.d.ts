export declare class CsrfService {
    private readonly tokenStore;
    private readonly tokenExpiry;
    generateToken(sessionId: string): string;
    validateToken(sessionId: string, providedToken: string): boolean;
    invalidateToken(sessionId: string): void;
    private cleanupExpiredTokens;
}
