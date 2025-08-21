# Production Deployment Guide

## Infrastructure Overview

### Frontend Deployment (Vercel)
- **Platform**: Vercel
- **Domain**: householdplanet.co.ke
- **CDN**: Automatic global CDN
- **SSL**: Automatic Let's Encrypt

### Backend Deployment (Railway/DigitalOcean)
- **Platform**: Railway or DigitalOcean Droplet
- **Domain**: api.householdplanet.co.ke
- **Database**: PostgreSQL with replication
- **Cache**: Redis
- **SSL**: Let's Encrypt via Nginx

### CDN & Security (Cloudflare)
- **DNS Management**: Cloudflare
- **CDN**: Global content delivery
- **Security**: DDoS protection, WAF
- **SSL**: Full SSL encryption

## Deployment Steps

### 1. Domain Setup
```bash
# Purchase domain: householdplanet.co.ke
# Configure nameservers to Cloudflare
# Import DNS records from cloudflare-dns.json
```

### 2. Frontend Deployment (Vercel)
```bash
cd household-planet-frontend
npm install -g vercel
vercel login
vercel --prod

# Configure environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.householdplanet.co.ke
# NEXT_PUBLIC_SITE_URL=https://householdplanet.co.ke
```

### 3. Backend Deployment (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Configure environment variables from .env.production
```

### 4. Database Setup
```bash
# PostgreSQL with replication
docker-compose -f docker-compose.prod.yml up -d postgres postgres-replica

# Run migrations
cd household-planet-backend
npx prisma migrate deploy
npx prisma generate
```

### 5. SSL Certificate Setup
```bash
chmod +x ssl-setup.sh
./ssl-setup.sh
```

### 6. Nginx Configuration
```bash
# Copy nginx.conf to server
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Monitoring Setup
```bash
docker-compose -f monitoring/docker-compose.monitoring.yml up -d
```

## Environment Variables

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.householdplanet.co.ke
NEXT_PUBLIC_SITE_URL=https://householdplanet.co.ke
NEXT_PUBLIC_MPESA_SHORTCODE=174379
NEXT_PUBLIC_ENVIRONMENT=production
```

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your_secure_secret
CORS_ORIGIN=https://householdplanet.co.ke
```

## Security Checklist

- [x] HTTPS enforcement
- [x] Security headers (CSP, HSTS, etc.)
- [x] Rate limiting
- [x] CORS configuration
- [x] Environment variables secured
- [x] Database credentials encrypted
- [x] API authentication
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection

## Performance Optimizations

- [x] CDN configuration
- [x] Image optimization
- [x] Gzip compression
- [x] Browser caching
- [x] Database indexing
- [x] Redis caching
- [x] Bundle optimization
- [x] Code splitting

## Monitoring & Alerts

- **Uptime**: Prometheus + Grafana
- **Performance**: Core Web Vitals
- **Errors**: Application logs
- **Security**: Access logs
- **Database**: Query performance

## Backup Strategy

- **Database**: Daily automated backups
- **Files**: Cloudinary backup
- **Code**: Git repository
- **Configuration**: Infrastructure as Code

## Rollback Plan

1. Keep previous Docker images
2. Database migration rollback scripts
3. DNS failover configuration
4. Automated health checks

## Post-Deployment

1. Verify all endpoints
2. Test payment integration
3. Check email delivery
4. Validate SSL certificates
5. Monitor performance metrics
6. Set up alerts

## Support Contacts

- **Domain**: Cloudflare support
- **Frontend**: Vercel support
- **Backend**: Railway/DigitalOcean support
- **Payments**: Safaricom M-Pesa support