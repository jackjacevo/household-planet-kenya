import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpsRedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only enforce HTTPS in production
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    // Check if request is already HTTPS
    const isHttps = req.secure || 
                   req.headers['x-forwarded-proto'] === 'https' ||
                   req.headers['x-forwarded-ssl'] === 'on';

    if (!isHttps) {
      // Construct HTTPS URL
      const httpsUrl = `https://${req.get('host')}${req.originalUrl}`;
      
      // Use 301 permanent redirect for better SEO
      return res.redirect(301, httpsUrl);
    }

    // Set security headers for HTTPS requests
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Forwarded-Proto', 'https');
    
    next();
  }
}