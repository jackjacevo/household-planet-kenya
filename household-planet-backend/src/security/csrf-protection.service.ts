import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class CsrfProtectionService {
  private readonly tokenStore = new Map<string, { token: string; expires: number }>();
  private readonly tokenExpiry = 3600000; // 1 hour in milliseconds

  /**
   * Generate a CSRF token for a session
   */
  generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + this.tokenExpiry;
    
    this.tokenStore.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(sessionId: string, providedToken: string): boolean {
    const storedData = this.tokenStore.get(sessionId);
    
    if (!storedData) {
      return false;
    }
    
    // Check if token has expired
    if (Date.now() > storedData.expires) {
      this.tokenStore.delete(sessionId);
      return false;
    }
    
    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(storedData.token, providedToken);
  }

  /**
   * Remove token for a session
   */
  removeToken(sessionId: string): void {
    this.tokenStore.delete(sessionId);
  }

  /**
   * Generate a double-submit cookie token
   */
  generateDoubleSubmitToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Validate double-submit cookie token
   */
  validateDoubleSubmitToken(cookieToken: string, headerToken: string): boolean {
    if (!cookieToken || !headerToken) {
      return false;
    }
    
    return this.constantTimeCompare(cookieToken, headerToken);
  }

  /**
   * Create a hash of the token for storage
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokenStore.entries()) {
      if (now > data.expires) {
        this.tokenStore.delete(sessionId);
      }
    }
  }

  /**
   * Get token info for debugging (without exposing the actual token)
   */
  getTokenInfo(sessionId: string): { exists: boolean; expires?: number } {
    const storedData = this.tokenStore.get(sessionId);
    
    if (!storedData) {
      return { exists: false };
    }
    
    return {
      exists: true,
      expires: storedData.expires
    };
  }
}