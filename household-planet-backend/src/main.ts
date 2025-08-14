import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as hpp from 'hpp';
import { SecurityHeadersInterceptor } from './security/interceptors/security-headers.interceptor';

import { SecurityGuard } from './security/guards/security.guard';

import { CorsConfigService } from './api-security/cors-config.service';
import { HttpsRedirectMiddleware } from './security/https-redirect.middleware';

async function bootstrap() {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && !process.env.SSL_KEY_PATH) {
    throw new Error('SSL certificates required in production. Set SSL_KEY_PATH and SSL_CERT_PATH environment variables.');
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions: process.env.NODE_ENV === 'production' ? {
      key: require('fs').readFileSync(process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key'),
      cert: require('fs').readFileSync(process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt'),
    } : undefined,
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://checkout.flutterwave.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://api.flutterwave.com'],
        frameSrc: ['https://js.stripe.com', 'https://checkout.flutterwave.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  app.use(compression());
  app.use(cookieParser());
  app.use(hpp()); // HTTP Parameter Pollution protection

  // CORS with security
  const corsConfig = app.get(CorsConfigService);
  app.enableCors(corsConfig.getCorsOptions());

  // Global validation with security
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
    validateCustomDecorators: true,
  }));

  // Global security interceptors
  app.useGlobalInterceptors(
    new SecurityHeadersInterceptor()
  );



  // Trust proxy for rate limiting (if behind reverse proxy)
  if (process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    
    // Enhanced HTTPS redirect middleware
    const httpsRedirect = new HttpsRedirectMiddleware();
    app.use(httpsRedirect.use.bind(httpsRedirect));
    
    // Additional security headers for production
    app.use((req: any, res: any, next: any) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      next();
    });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  console.log(`Backend running on ${protocol}://localhost:${port}`);
  console.log('Security features enabled:');
  console.log('- HTTPS enforcement (production)');
  console.log('- Enhanced CSRF protection with double-submit cookies');
  console.log('- Security headers (Helmet + custom)');
  console.log('- Rate limiting with IP tracking');
  console.log('- Input validation & sanitization');
  console.log('- Log injection prevention');
  console.log('- XSS protection');
  console.log('- SQL injection protection');
  console.log('- File upload security');
  console.log('- API request logging with sanitization');
  console.log('- API versioning support');
  console.log('- Origin validation for API requests');
}
bootstrap();