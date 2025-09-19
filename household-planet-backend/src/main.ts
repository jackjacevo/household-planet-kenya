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
    logger: ['log', 'error', 'warn', 'debug'], // Enable all logs to see CORS messages
    cors: true, // Enable CORS at app level
  });
  
  // Serve static files from uploads directory
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Serving static files from:', uploadsPath);
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    setHeaders: (res, path, stat) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  });
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: false // Disable HSTS temporarily
  }));
  
  app.use(cookieParser());
  app.use(session(SessionConfig.getSessionConfig()));
  

  

  
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
  
  // CORS configuration - MUST be before routes
  app.enableCors({
    origin: true, // Allow all origins temporarily
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Cache-Control', 
      'Pragma', 
      'X-Requested-With', 
      'Origin'
    ],
    optionsSuccessStatus: 200
  });
  
  // Add global CORS headers middleware as backup
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Cache-Control,Pragma,X-Requested-With,Origin');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });
  
  // Health check endpoints
  app.getHttpAdapter().get('/health', (req: any, res: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cors: 'enabled-all-origins'
    });
  });
  
  app.getHttpAdapter().get('/api/health', (req: any, res: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cors: 'enabled-all-origins'
    });
  });
  

  
  // Trust proxy for IP address detection
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  
  // Disable X-Powered-By header
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  
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
  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔗 CORS: ENABLED FOR ALL ORIGINS (TEMPORARY FIX)`);
  logger.log(`📊 Health check: http://0.0.0.0:${port}/health`);
  logger.log(`⚠️  CORS BYPASS ACTIVE - REMOVE IN PRODUCTION`);
}

bootstrap().catch(err => {
  console.error('❌ Failed to start application:', err);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});
