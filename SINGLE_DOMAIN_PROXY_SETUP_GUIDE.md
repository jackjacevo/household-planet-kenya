# Single Domain Proxy Setup Guide for Dokploy

## Problem Identified
The frontend was configured to make direct API calls to `http://158.220.99.195:3001`, but in a single domain setup with proxy, all API calls should go through the same domain (`https://householdplanet.co.ke`).

## Solution Implemented

### 1. Frontend Configuration Fixed
- **Before**: `NEXT_PUBLIC_API_URL=http://158.220.99.195:3001`
- **After**: `NEXT_PUBLIC_API_URL=https://householdplanet.co.ke`

### 2. Next.js Proxy Configuration
```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: process.env.NODE_ENV === 'production' 
        ? 'http://household-planet-backend:3001/api/:path*'  // Docker container name
        : 'http://localhost:3001/api/:path*', // Local development
    },
  ];
}
```

### 3. Docker Configuration for Dokploy
Created `dokploy.yml` with proper container networking:

```yaml
services:
  household-planet-backend:
    # Internal only - no external port exposure
    expose:
      - "3001"
    environment:
      CORS_ORIGIN: http://household-planet-frontend:3000

  household-planet-frontend:
    # Public facing
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: https://householdplanet.co.ke
```

## How It Works

### Request Flow
1. User visits `https://householdplanet.co.ke`
2. Frontend makes API call to `https://householdplanet.co.ke/api/categories`
3. Next.js proxy intercepts `/api/*` requests
4. Proxy forwards to `http://household-planet-backend:3001/api/categories`
5. Backend responds through the proxy back to frontend

### Benefits
- ✅ Single domain for users (householdplanet.co.ke)
- ✅ Simplified SSL/DNS management
- ✅ Backend is hidden from direct access
- ✅ Faster client calls (no cross-domain requests)
- ✅ Better security (backend not exposed)

## Deployment Steps for Dokploy

### 1. Update Environment Variables
```bash
# In Dokploy dashboard, set these environment variables:
NEXT_PUBLIC_API_URL=https://householdplanet.co.ke
NEXT_PUBLIC_SITE_URL=https://householdplanet.co.ke
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secure-jwt-secret
```

### 2. Container Configuration
- **Frontend Container**: `household-planet-frontend` (port 3000 exposed)
- **Backend Container**: `household-planet-backend` (port 3001 internal only)
- **Network**: Both containers on same Docker network

### 3. Domain Configuration
- Point `householdplanet.co.ke` to the frontend container (port 3000)
- Enable SSL/TLS certificate
- No separate domain needed for backend

### 4. Verification Commands
```bash
# Test the proxy setup
node test-proxy-setup.js

# Check if containers are running
docker ps

# Check container logs
docker logs household-planet-frontend
docker logs household-planet-backend
```

## Troubleshooting

### If API calls fail:
1. **Check container networking**: Ensure both containers are on the same network
2. **Verify container names**: Must match exactly in next.config.js
3. **Check backend health**: `docker logs household-planet-backend`
4. **Verify proxy config**: Check next.config.js rewrites section

### If direct backend access works:
- This indicates the proxy is not configured correctly
- Backend should only be accessible internally

### Common Issues:
- **CORS errors**: Backend CORS should allow frontend container, not external domain
- **Container name mismatch**: next.config.js must use exact Docker container names
- **Environment variables**: Ensure NEXT_PUBLIC_API_URL points to the main domain

## Files Modified
1. `household-planet-frontend/.env.production`
2. `household-planet-frontend/next.config.js`
3. `docker-compose.prod.yml`
4. Created `dokploy.yml`

## Testing
Run the test script to verify configuration:
```bash
node test-proxy-setup.js
```

Expected results:
- ✅ Production API endpoints working through proxy
- ✅ Direct backend access blocked
- ✅ Single domain serving both frontend and API

## Next Steps
1. Deploy using the updated configuration
2. Verify domain DNS points to the frontend container
3. Test all API endpoints through the proxy
4. Monitor container logs for any issues