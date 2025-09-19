# Production Deployment Guide

## Issues Addressed

### ✅ 1. Database Table Missing - Settings Table
- **Issue**: The settings table doesn't exist
- **Solution**: Created `scripts/create-settings-table.js` to initialize the settings table with default values
- **Usage**: `npm run create:settings`

### ✅ 2. Security Vulnerabilities - 6 High Severity NPM Vulnerabilities
- **Issue**: High severity vulnerabilities in axios, puppeteer, and ws packages
- **Solution**: Updated vulnerable packages to secure versions:
  - `axios`: ^1.12.0 (was ^1.11.0)
  - `puppeteer`: ^24.22.0 (was ^21.0.0)
  - `ws`: Updated via puppeteer dependency
- **Usage**: `npm run fix:security && npm install`

### ✅ 3. Production Warnings - Memory Store Not Suitable for Production
- **Issue**: Express session using memory store in production
- **Solution**: 
  - Created `SessionConfig` class with production warnings
  - Added Redis configuration for production sessions
  - Memory store usage now shows clear warnings in production
- **Production Setup**: Configure `REDIS_URL` environment variable

## Quick Setup

Run the complete production setup:

```bash
npm run setup:production
```

This script will:
1. Fix security vulnerabilities
2. Install updated packages
3. Generate Prisma client
4. Push database schema
5. Create settings table
6. Build application
7. Verify production readiness

## Manual Setup Steps

### 1. Fix Security Issues
```bash
npm run fix:security
npm install
```

### 2. Database Setup
```bash
npx prisma generate
npx prisma db push
npm run create:settings
```

### 3. Build Application
```bash
npm run build
```

## Environment Configuration

### Development (.env)
```env
NODE_ENV=development
DATABASE_URL=file:./prisma/dev.db
# ... other dev settings
```

### Production (.env.production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@localhost:5432/household_planet_prod
REDIS_URL=redis://localhost:6379
# ... other production settings
```

## Production Requirements

### Required Services
1. **PostgreSQL Database** - Replace SQLite for production
2. **Redis Server** - For session storage (prevents memory store warnings)
3. **Reverse Proxy** - nginx or similar
4. **SSL Certificates** - For HTTPS

### Environment Variables
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Strong production secret
- `SESSION_SECRET` - Strong session secret
- `CORS_ORIGIN` - Production domain

## Docker Deployment

### Build Production Image
```bash
docker build -f Dockerfile.production -t household-planet-backend:prod .
```

### Run with Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: household_planet_prod
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
  
  redis:
    image: redis:7-alpine
```

## Health Checks

The application provides health check endpoints:
- `/health` - Basic health check
- `/api/health` - API health check

## Security Features

- Helmet security headers
- Rate limiting
- Input sanitization
- CORS configuration
- Session security
- JWT authentication
- Security logging

## Monitoring

Production logging includes:
- Security events
- Admin activities
- Error tracking
- Performance metrics

## Deployment Verification

After deployment, verify:
1. ✅ Settings table exists and populated
2. ✅ No high severity npm vulnerabilities
3. ✅ Redis session store configured (no memory store warnings)
4. ✅ Database connection working
5. ✅ Health endpoints responding
6. ✅ CORS configured correctly
7. ✅ SSL certificates valid

## Troubleshooting

### Settings Table Issues
```bash
# Check if settings exist
npm run create:settings

# Verify in database
npx prisma studio
```

### Security Vulnerabilities
```bash
# Check current vulnerabilities
npm audit --audit-level=high

# Fix automatically
npm run fix:security
npm install
```

### Session Store Warnings
```bash
# Ensure Redis is configured
echo $REDIS_URL

# Check Redis connection
redis-cli ping
```

## Support

For deployment issues:
1. Check logs: `docker logs <container-name>`
2. Verify environment variables
3. Test database connectivity
4. Confirm Redis availability
5. Check firewall/security groups