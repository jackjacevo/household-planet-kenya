import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';
export const RATE_LIMIT_WINDOW_KEY = 'rateLimitWindow';

export const RateLimit = (limit: number, windowMs: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata('rateLimit', limit)(target, propertyKey, descriptor);
    SetMetadata('rateLimitWindow', windowMs)(target, propertyKey, descriptor);
  };
};
