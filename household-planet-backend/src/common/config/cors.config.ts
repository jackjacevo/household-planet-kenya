import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// TEMPORARY CORS BYPASS - ALLOWS ALL ORIGINS
// TODO: Restrict to specific domains in production

export const corsConfig: CorsOptions = {
  origin: true, // TEMPORARY: Allow all origins to fix CORS issues
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
    'API-Version',
    'X-Client-Version',
    'Accept',
    'Cache-Control',
    'Pragma',
    'Origin'
  ],
  exposedHeaders: [
    'X-CSRF-Token',
    'API-Version',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};
