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
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Serving static files from:', uploadsPath);
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
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
  
  // Health check endpoint (before global prefix)
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enhanced CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://householdplanet.co.ke', 'http://household-planet-frontend:3000']
      : process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Pragma'],
  });
  
  // Enable CORS for static files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cache-Control', 'public, max-age=31536000');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  });
  
  // Trust proxy for IP address detection
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  
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