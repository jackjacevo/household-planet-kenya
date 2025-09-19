import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);
    
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cachedItem = this.cache.get(cacheKey);
    if (cachedItem && this.isValid(cachedItem)) {
      return of(cachedItem.data);
    }

    return next.handle().pipe(
      tap(data => {
        const ttl = this.getTTL(request.url);
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        
        this.cleanupExpired();
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, query, user } = request;
    const userId = user?.id || 'anonymous';
    return `${url}_${JSON.stringify(query)}_${userId}`;
  }

  private isValid(item: CacheItem): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  private getTTL(url: string): number {
    if (url.includes('/products')) return 10 * 60 * 1000;
    if (url.includes('/categories')) return 30 * 60 * 1000;
    if (url.includes('/orders')) return 1 * 60 * 1000;
    return this.DEFAULT_TTL;
  }

  private cleanupExpired(): void {
    for (const [key, item] of this.cache.entries()) {
      if (!this.isValid(item)) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
