# API Proxy Setup for Single Domain Deployment

## Overview
Your Next.js app now proxies API requests internally, so you only need to expose the frontend domain (`householdplanetkenya.co.ke`).

## Changes Made

### 1. Next.js Configuration (`next.config.js`)
Added API proxy that routes `/api/*` requests to the backend:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: process.env.NODE_ENV === 'production' 
        ? 'http://backend:3001/api/:path*'  // Docker container name
        : 'http://localhost:3001/api/:path*', // Local development
    },
  ];
},
```

### 2. Environment Configuration (`.env.production`)
Set `NEXT_PUBLIC_API_URL=` (empty) so requests use relative paths.

## Dokploy Configuration

### Single Domain Setup
1. **Domain**: `householdplanetkenya.co.ke` → Port `3000` (frontend only)
2. **No subdomain needed** for API

### Docker Compose
Your existing `docker-compose.prod.yml` works perfectly:
- Frontend: Port 3000 (exposed)
- Backend: Port 3001 (internal only)
- Services communicate via Docker network

## How It Works

```
User Request: householdplanetkenya.co.ke/api/products
    ↓
Next.js Proxy: Rewrites to http://backend:3001/api/products
    ↓
Backend Response: Returns product data
    ↓
User Receives: Product data from householdplanetkenya.co.ke
```

## Benefits
- ✅ Single domain configuration
- ✅ No CORS issues
- ✅ Simplified SSL setup
- ✅ Better security (backend not exposed)
- ✅ Easier deployment management

## Testing
1. **Local Development**: Still works with `http://localhost:3001`
2. **Production**: API calls automatically routed through proxy

## Deployment Steps
1. Build and deploy with existing docker-compose
2. Configure Dokploy domain to point to port 3000 only
3. All API requests will be automatically proxied