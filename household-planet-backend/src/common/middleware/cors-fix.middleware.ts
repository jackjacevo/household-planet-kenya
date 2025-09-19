import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsFixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://householdplanetkenya.co.ke',
      'https://www.householdplanetkenya.co.ke',
      'http://localhost:3000'
    ];

    // Only set specific origin if it's in our allowed list
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      // For requests without origin (mobile apps, etc.)
      res.setHeader('Access-Control-Allow-Origin', 'https://householdplanetkenya.co.ke');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, Pragma, X-Requested-With, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  }
}