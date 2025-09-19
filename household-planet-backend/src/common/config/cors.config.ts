import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://householdplanetkenya.co.ke',
      'https://www.householdplanetkenya.co.ke',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
