# Deployment Guide - Household Planet Kenya

## Production Deployment Checklist

### 1. Environment Configuration

#### Frontend (.env.production)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.householdplanetkenya.co.ke
NEXT_PUBLIC_SITE_URL=https://householdplanetkenya.co.ke

# Business Information
NEXT_PUBLIC_BUSINESS_EMAIL=info@householdplanetkenya.co.ke
NEXT_PUBLIC_BUSINESS_PHONE=+254700000000
NEXT_PUBLIC_WHATSAPP_NUMBER=+254700000000

# Social Media
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/householdplanetkenya
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/householdplanetkenya
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/householdplanetke

# Analytics (Replace with actual IDs)
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=000000000000000
```

#### Backend (.env)
```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/household_planet

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://householdplanetkenya.co.ke

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Build Commands

#### Frontend Build
```bash
cd household-planet-frontend
npm install
npm run build
npm start
```

#### Backend Build
```bash
cd household-planet-backend
npm install
npm run build
npm run start:prod
```

### 3. Production Optimizations

#### Frontend Optimizations
- ✅ Image optimization with Next.js Image component
- ✅ Responsive grid layouts (1-4 columns based on screen size)
- ✅ Lazy loading for images and components
- ✅ SEO optimization with proper meta tags
- ✅ Production API URLs configured
- ✅ Error boundaries for graceful error handling

#### Backend Optimizations
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling middleware
- ✅ Database connection pooling

### 4. Server Requirements

#### Minimum Server Specifications
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Bandwidth**: 100GB/month
- **OS**: Ubuntu 20.04 LTS or newer

#### Recommended Server Specifications
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Bandwidth**: 500GB/month

### 5. Domain Configuration

#### DNS Records
```
A     @                    YOUR_SERVER_IP
A     www                  YOUR_SERVER_IP
A     api                  YOUR_SERVER_IP
CNAME admin                api.householdplanetkenya.co.ke
```

#### SSL Certificate
- Use Let's Encrypt for free SSL certificates
- Configure automatic renewal

### 6. Nginx Configuration

```nginx
# Frontend (householdplanetkenya.co.ke)
server {
    listen 80;
    listen 443 ssl;
    server_name householdplanetkenya.co.ke www.householdplanetkenya.co.ke;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API (api.householdplanetkenya.co.ke)
server {
    listen 80;
    listen 443 ssl;
    server_name api.householdplanetkenya.co.ke;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Process Management (PM2)

#### Install PM2
```bash
npm install -g pm2
```

#### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: 'household-planet-frontend',
      script: 'npm',
      args: 'start',
      cwd: './household-planet-frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'household-planet-backend',
      script: 'npm',
      args: 'run start:prod',
      cwd: './household-planet-backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

#### Start Applications
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Database Setup

#### PostgreSQL Installation
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb household_planet
```

#### Database Migration
```bash
cd household-planet-backend
npm run migration:run
```

### 9. Monitoring & Logging

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

#### Log Rotation
```bash
pm2 install pm2-logrotate
```

### 10. Security Checklist

- ✅ HTTPS enabled with SSL certificates
- ✅ Environment variables secured
- ✅ Database credentials protected
- ✅ CORS properly configured
- ✅ Input validation implemented
- ✅ Rate limiting configured
- ✅ Security headers added

### 11. Performance Monitoring

#### Key Metrics to Monitor
- Response time
- Error rates
- Memory usage
- CPU usage
- Database performance
- User engagement

#### Tools
- PM2 monitoring
- Google Analytics
- Server monitoring (htop, iostat)

### 12. Backup Strategy

#### Database Backup
```bash
# Daily backup
pg_dump household_planet > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump household_planet > $BACKUP_DIR/household_planet_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

#### File Backup
- Regular backup of uploaded files
- Code repository backup
- Configuration files backup

### 13. Deployment Commands

#### Quick Deployment
```bash
# Pull latest changes
git pull origin main

# Frontend
cd household-planet-frontend
npm install
npm run build
pm2 restart household-planet-frontend

# Backend
cd ../household-planet-backend
npm install
npm run build
pm2 restart household-planet-backend
```

### 14. Troubleshooting

#### Common Issues
1. **API Connection Issues**: Check CORS configuration and API URLs
2. **Build Failures**: Verify Node.js version and dependencies
3. **Database Connection**: Check database credentials and network access
4. **SSL Issues**: Verify certificate paths and renewal

#### Debug Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs household-planet-frontend
pm2 logs household-planet-backend

# Check server resources
htop
df -h
```

### 15. Post-Deployment Verification

#### Frontend Checklist
- [ ] Homepage loads correctly
- [ ] Product categories display properly
- [ ] Product cards show without being cut off
- [ ] Responsive design works on all devices
- [ ] Images load correctly
- [ ] Navigation works
- [ ] Contact forms function

#### Backend Checklist
- [ ] API endpoints respond correctly
- [ ] Database connections work
- [ ] Authentication functions
- [ ] File uploads work
- [ ] Error handling works

#### Performance Checklist
- [ ] Page load times < 3 seconds
- [ ] Images optimized and loading
- [ ] No console errors
- [ ] Mobile performance acceptable
- [ ] SEO meta tags present

This deployment guide ensures your Household Planet Kenya e-commerce platform runs smoothly in production with proper performance, security, and monitoring.