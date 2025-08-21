import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || 100;
    const windowMs = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || 15 * 60 * 1000; // 15 minutes

    const key = this.generateKey(request);
    const now = Date.now();
    
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return true;
    }

    if (this.store[key].count >= limit) {
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000)
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    this.store[key].count++;
    return true;
  }

  private generateKey(request: any): string {
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.userId || 'anonymous';
    return `${ip}:${userId}`;
  }
}