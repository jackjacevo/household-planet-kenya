import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
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
import { SessionConfig } from './config/session.config';
import { join } from 'path';

async function bootstrap() {
  // Initialize database
  const logger = new Logger('Bootstrap');
  logger.log('Initializing database...');
  
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
    setHeaders: (res, path, stat) => {
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
  app.use(session(SessionConfig.getSessionConfig()));
  
  // Custom CORS middleware for debugging
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://householdplanetkenya.co.ke',
      'https://www.householdplanetkenya.co.ke',
      'http://localhost:3000'
    ];
    
    console.log('Custom CORS middleware - Origin:', origin);
    
    // Always set CORS headers for allowed origins or no origin
    if (allowedOrigins.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin || 'https://householdplanetkenya.co.ke');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Cache-Control,Pragma,X-Requested-With,Origin,Access-Control-Request-Method,Access-Control-Request-Headers');
      res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    } else {
      // Temporarily allow all origins for debugging
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Cache-Control,Pragma,X-Requested-With,Origin,Access-Control-Request-Method,Access-Control-Request-Headers');
      console.log('Temporarily allowing origin for debugging:', origin);
    }
    
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    
    next();
  });
  
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
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Health check endpoints for Dokploy
  app.getHttpAdapter().get('/health', (req: any, res: any) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cors_origin: process.env.CORS_ORIGIN
    });
  });
  
  app.getHttpAdapter().get('/api/health', (req: any, res: any) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cors_origin: process.env.CORS_ORIGIN
    });
  });
  
  // API communication test endpoints
  app.getHttpAdapter().get('/cors-test', (req: any, res: any) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).json({ 
      cors: 'working', 
      origin: origin,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cors_origin: process.env.CORS_ORIGIN,
      headers: req.headers
    });
  });
  
  app.getHttpAdapter().get('/api/cors-test', (req: any, res: any) => {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).json({ 
      cors: 'working', 
      origin: origin,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cors_origin: process.env.CORS_ORIGIN,
      headers: req.headers
    });
  });
  
  // Enhanced CORS configuration for production
  const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : [];
  const corsOrigins = [
    'https://householdplanetkenya.co.ke',
    'https://www.householdplanetkenya.co.ke',
    'http://localhost:3000', // For development
    ...envOrigins
  ].filter(Boolean);
  
  console.log('CORS Origins configured:', corsOrigins);
    
  app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS request from origin:', origin);
      
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        console.log('Allowing request with no origin');
        return callback(null, true);
      }
      
      if (corsOrigins.includes(origin)) {
        console.log('Allowing origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        console.log('Allowed origins:', corsOrigins);
        callback(null, true); // Temporarily allow all origins for debugging
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Cache-Control', 
      'Pragma', 
      'X-Requested-With', 
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count', 'X-Page-Count'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // Enable CORS for static files with proper origin handling
  app.use('/uploads', (req, res, next) => {
    const allowedOrigins = corsOrigins;
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
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
  
  // Initialize Prisma and push schema
  const prismaService = app.get(PrismaService);
  try {
    await prismaService.$connect();
    logger.log('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
  
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`CORS Origin: ${process.env.CORS_ORIGIN}`);
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
