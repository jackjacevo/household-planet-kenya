import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  private readonly tokenStore = new Map<string, { token: string; expires: Date }>();
  private readonly tokenExpiry = 3600000; // 1 hour

  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + this.tokenExpiry);
    
    this.tokenStore.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  validateToken(sessionId: string, providedToken: string): boolean {
    const storedData = this.tokenStore.get(sessionId);
    
    if (!storedData) {
      return false;
    }
    
    if (storedData.expires < new Date()) {
      this.tokenStore.delete(sessionId);
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(storedData.token),
      Buffer.from(providedToken)
    );
  }

  invalidateToken(sessionId: string): void {
    this.tokenStore.delete(sessionId);
  }

  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [sessionId, data] of this.tokenStore.entries()) {
      if (data.expires < now) {
        this.tokenStore.delete(sessionId);
      }
    }
  }
}