import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { SecurityExceptionFilter } from './common/filters/security-exception.filter';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { InputSanitizationMiddleware } from './common/middleware/input-sanitization.middleware';
import { SecurityLoggingInterceptor } from './common/interceptors/security-logging.interceptor';
import { ApiVersionInterceptor } from './common/interceptors/api-version.interceptor';
import { DeprecationInterceptor } from './common/interceptors/deprecation.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'debug', 'error', 'verbose', 'warn'],
    httpsOptions: process.env.NODE_ENV === 'production' ? {
      // HTTPS configuration for production
    } : undefined,
  });
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // We handle CSP in SecurityMiddleware
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    }
  }));
  
  // Custom security middleware
  const securityMiddleware = new SecurityMiddleware();
  const inputSanitizationMiddleware = new InputSanitizationMiddleware();
  
  app.use((req, res, next) => securityMiddleware.use(req, res, next));
  app.use((req, res, next) => inputSanitizationMiddleware.use(req, res, next));
  
  // Global exception filter
  app.useGlobalFilters(new SecurityExceptionFilter());
  
  // Global security interceptors
  app.useGlobalInterceptors(
    new SecurityLoggingInterceptor(),
    new ApiVersionInterceptor(app.get('Reflector')),
    new DeprecationInterceptor(app.get('Reflector'))
  );
  
  // Compression middleware
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses > 1KB
    level: 6, // Compression level (1-9)
  }));
  
  // Global validation pipe with performance optimizations
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
    validateCustomDecorators: true,
  }));
  
  // Enhanced CORS configuration
  const { corsConfig } = await import('./common/config/cors.config');
  app.enableCors(corsConfig);
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Serve uploads without API prefix
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Trust proxy for production
  if (process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});