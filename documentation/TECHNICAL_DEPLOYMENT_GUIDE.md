# Technical Deployment Guide - Household Planet Kenya

## Overview
This guide provides step-by-step instructions for deploying the Household Planet Kenya e-commerce platform to production.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │     Vercel      │    │    Railway     │
│   (CDN/DNS)     │────│   (Frontend)    │────│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   (Database)    │
                                              └─────────────────┘
```

---

## Prerequisites

### Required Accounts
- [x] Vercel account for frontend hosting
- [x] Railway account for backend hosting
- [x] Cloudflare account for DNS and CDN
- [x] Domain name (householdplanet.co.ke)
- [x] GitHub repository access

### Required Tools
- Node.js 18+ and npm
- Git
- Docker (optional)
- Railway CLI
- Vercel CLI

### Environment Setup
```bash
# Install required CLIs
npm install -g @railway/cli
npm install -g vercel

# Clone repository
git clone https://github.com/your-org/household-planet-kenya.git
cd household-planet-kenya
```

---

## Database Setup

### 1. PostgreSQL Database (Railway)

**Create Database:**
```bash
# Login to Railway
railway login

# Create new project
railway new

# Add PostgreSQL service
railway add postgresql

# Get database URL
railway variables
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Database Migration

**Run Migrations:**
```bash
cd household-planet-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data
npm run seed
```

**Verify Database:**
```bash
# Check database connection
npx prisma db pull

# View data
npx prisma studio
```

---

## Backend Deployment (Railway)

### 1. Prepare Backend

**Environment Configuration:**
```bash
cd household-planet-backend

# Create production environment file
cp .env.example .env.production
```

**Update .env.production:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://householdplanet.co.ke

# Payment Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@householdplanet.co.ke
EMAIL_PASS=your_app_password

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### 2. Deploy to Railway

**Initialize Railway:**
```bash
# Connect to Railway project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set JWT_SECRET=your-jwt-secret
# ... set all other variables
```

**Deploy:**
```bash
# Deploy backend
railway up

# Check deployment status
railway status

# View logs
railway logs
```

**Custom Domain Setup:**
```bash
# Add custom domain
railway domain add api.householdplanet.co.ke
```

### 3. Verify Backend Deployment

**Health Check:**
```bash
curl https://api.householdplanet.co.ke/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456
}
```

---

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

**Environment Configuration:**
```bash
cd household-planet-frontend

# Create production environment file
cp .env.local.example .env.production
```

**Update .env.production:**
```env
NEXT_PUBLIC_API_URL=https://api.householdplanet.co.ke
NEXT_PUBLIC_SITE_URL=https://householdplanet.co.ke
NEXT_PUBLIC_MPESA_SHORTCODE=174379
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

### 2. Deploy to Vercel

**Initialize Vercel:**
```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# ... add all environment variables
```

**Deploy:**
```bash
# Deploy to production
vercel --prod

# Check deployment
vercel ls
```

**Custom Domain Setup:**
1. Go to Vercel dashboard
2. Select project
3. Go to Settings → Domains
4. Add `householdplanet.co.ke` and `www.householdplanet.co.ke`

### 3. Verify Frontend Deployment

**Check Website:**
```bash
curl -I https://householdplanet.co.ke
```

**Performance Test:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse https://householdplanet.co.ke --output html --output-path ./lighthouse-report.html
```

---

## DNS and CDN Setup (Cloudflare)

### 1. Domain Configuration

**Add Domain to Cloudflare:**
1. Login to Cloudflare dashboard
2. Click "Add a Site"
3. Enter `householdplanet.co.ke`
4. Choose plan (Free is sufficient)
5. Update nameservers at domain registrar

### 2. DNS Records

**Required DNS Records:**
```
Type    Name    Content                          Proxy
A       @       76.76.19.123 (Vercel IP)       ✅ Proxied
A       www     76.76.19.123 (Vercel IP)       ✅ Proxied
CNAME   api     railway-production-url          ✅ Proxied
MX      @       mail.householdplanet.co.ke      ❌ DNS Only
TXT     @       v=spf1 include:_spf.google.com  ❌ DNS Only
```

### 3. SSL/TLS Configuration

**SSL Settings:**
1. Go to SSL/TLS → Overview
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

**Security Headers:**
1. Go to SSL/TLS → Edge Certificates
2. Enable "HTTP Strict Transport Security (HSTS)"
3. Set max-age to 12 months
4. Include subdomains and preload

### 4. Performance Optimization

**Caching Rules:**
```
Rule 1: Static Assets
- URL Pattern: *.css, *.js, *.png, *.jpg, *.gif, *.ico, *.svg
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month

Rule 2: API Endpoints
- URL Pattern: api.householdplanet.co.ke/*
- Cache Level: Bypass

Rule 3: HTML Pages
- URL Pattern: householdplanet.co.ke/*
- Cache Level: Standard
- Edge Cache TTL: 2 hours
```

**Speed Optimizations:**
1. Enable "Auto Minify" for CSS, JavaScript, and HTML
2. Enable "Brotli" compression
3. Enable "Rocket Loader" for JavaScript optimization

---

## Monitoring and Alerting Setup

### 1. Application Monitoring (Sentry)

**Backend Integration:**
```javascript
// In main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

**Frontend Integration:**
```javascript
// In _app.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: 'production',
});
```

### 2. Uptime Monitoring

**UptimeRobot Setup:**
1. Create account at uptimerobot.com
2. Add monitors:
   - https://householdplanet.co.ke (HTTP)
   - https://api.householdplanet.co.ke/health (HTTP)
3. Set alert contacts (email, SMS, Slack)
4. Configure 5-minute check intervals

### 3. Performance Monitoring

**Google Analytics:**
```html
<!-- Add to _document.tsx -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Security Configuration

### 1. Environment Security

**Secure Environment Variables:**
- Never commit .env files to git
- Use different secrets for production
- Rotate secrets regularly
- Use strong, unique passwords

### 2. API Security

**Rate Limiting:**
```javascript
// In main.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**CORS Configuration:**
```javascript
app.enableCors({
  origin: ['https://householdplanet.co.ke'],
  credentials: true,
});
```

### 3. Database Security

**Connection Security:**
- Use SSL connections
- Restrict database access by IP
- Use strong database passwords
- Regular security updates

---

## Backup and Recovery

### 1. Database Backups

**Automated Backups:**
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://household-planet-backups/
```

**Schedule with Cron:**
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### 2. File Backups

**Static Files:**
- Images stored in Cloudinary (automatic backup)
- Code stored in Git repository
- Configuration files backed up separately

---

## Testing in Production

### 1. Smoke Tests

**Critical Path Testing:**
```bash
# Test homepage
curl -f https://householdplanet.co.ke

# Test API health
curl -f https://api.householdplanet.co.ke/health

# Test product API
curl -f https://api.householdplanet.co.ke/api/products

# Test authentication
curl -X POST https://api.householdplanet.co.ke/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. End-to-End Testing

**User Journey Test:**
1. Visit homepage
2. Browse products
3. Add item to cart
4. Create account
5. Complete checkout
6. Verify order confirmation

### 3. Performance Testing

**Load Testing:**
```bash
# Install k6
npm install -g k6

# Run load test
k6 run --vus 10 --duration 30s load-test.js
```

---

## Go-Live Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Monitoring systems active
- [ ] Backup systems verified
- [ ] Performance tests passed
- [ ] Security scans completed

### Launch Day
- [ ] Final deployment completed
- [ ] Smoke tests passed
- [ ] Monitoring alerts configured
- [ ] Team notified and ready
- [ ] Rollback plan prepared
- [ ] Customer support ready

### Post-Launch
- [ ] Monitor system performance
- [ ] Check error rates
- [ ] Verify customer transactions
- [ ] Monitor user feedback
- [ ] Review system logs

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check database status
railway logs --service postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Frontend Build Failures:**
```bash
# Check build logs
vercel logs

# Local build test
npm run build
```

**API Errors:**
```bash
# Check backend logs
railway logs

# Test API endpoints
curl -v https://api.householdplanet.co.ke/health
```

### Rollback Procedures

**Frontend Rollback:**
```bash
# Rollback to previous deployment
vercel rollback
```

**Backend Rollback:**
```bash
# Redeploy previous version
git checkout previous-commit
railway up
```

**Database Rollback:**
```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup_file.sql
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor system health
- Check error logs
- Verify backup completion

**Weekly:**
- Review performance metrics
- Update dependencies
- Security scan

**Monthly:**
- Rotate secrets
- Review and update documentation
- Capacity planning review

### Updates and Patches

**Security Updates:**
1. Test in staging environment
2. Schedule maintenance window
3. Deploy updates
4. Verify system functionality
5. Monitor for issues

**Feature Deployments:**
1. Code review and testing
2. Deploy to staging
3. User acceptance testing
4. Deploy to production
5. Monitor and verify

---

*This deployment guide should be updated as the system evolves and new requirements emerge.*