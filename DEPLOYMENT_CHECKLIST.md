# Deployment Checklist for Single Domain Proxy Setup

## ✅ Configuration Fixed

### Frontend Configuration
- [x] Updated `.env.production`: `NEXT_PUBLIC_API_URL=https://householdplanetkenya.co.ke`
- [x] Fixed `next.config.js` proxy configuration
- [x] Container name updated to `household-planet-backend:3001`

### Docker Configuration
- [x] Created `dokploy.yml` for proper container setup
- [x] Backend container: internal only (expose 3001)
- [x] Frontend container: public facing (port 3000)
- [x] Updated `docker-compose.prod.yml`

## 🚀 Deployment Steps for Dokploy

### 1. Environment Variables to Set in Dokploy
```
NEXT_PUBLIC_API_URL=https://householdplanetkenya.co.ke
NEXT_PUBLIC_SITE_URL=https://householdplanetkenya.co.ke
NEXT_PUBLIC_ENVIRONMENT=production
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secure-jwt-secret-key
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
MPESA_PASSKEY=your-mpesa-passkey
```

### 2. Container Configuration
- **Service Names**: 
  - `household-planet-frontend` (public, port 3000)
  - `household-planet-backend` (internal, port 3001)
- **Network**: Same Docker network for both containers
- **Domain**: Point `householdplanetkenya.co.ke` to frontend container only

### 3. Verification After Deployment
```bash
# Test the proxy setup
curl https://householdplanetkenya.co.ke/api/health
curl https://householdplanetkenya.co.ke/api/categories
curl https://householdplanetkenya.co.ke/api/products

# Should return JSON responses, not errors
```

### 4. Expected Behavior
- ✅ `https://householdplanetkenya.co.ke` → Frontend
- ✅ `https://householdplanetkenya.co.ke/api/*` → Backend (via proxy)
- ❌ Direct backend access should be blocked
- ✅ All API calls work through the single domain

## 🔧 Files Ready for Deployment

1. **dokploy.yml** - Main deployment configuration
2. **docker-compose.prod.yml** - Updated production compose
3. **household-planet-frontend/.env.production** - Fixed API URL
4. **household-planet-frontend/next.config.js** - Proxy configuration

## 🧪 Testing Tools Created

1. **test-proxy-setup.js** - Comprehensive proxy testing
2. **test-frontend-backend-connection.js** - Basic connection testing

## ⚠️ Important Notes

1. **Backend Security**: Backend is not directly accessible from outside
2. **CORS Configuration**: Backend CORS allows frontend container, not external domain
3. **SSL/TLS**: Only needed for the main domain (householdplanetkenya.co.ke)
4. **Container Names**: Must match exactly in next.config.js proxy configuration

## 🎯 Success Criteria

After deployment, these should work:
- [ ] `https://householdplanetkenya.co.ke` loads the frontend
- [ ] `https://householdplanetkenya.co.ke/api/health` returns backend health status
- [ ] `https://householdplanetkenya.co.ke/api/categories` returns categories
- [ ] `https://householdplanetkenya.co.ke/api/products` returns products
- [ ] User can browse products, add to cart, and place orders
- [ ] All functionality works through the single domain

## 🚨 If Issues Occur

1. **Check container logs**:
   ```bash
   docker logs household-planet-frontend
   docker logs household-planet-backend
   ```

2. **Verify container networking**:
   ```bash
   docker network ls
   docker network inspect [network-name]
   ```

3. **Test internal connectivity**:
   ```bash
   docker exec household-planet-frontend curl http://household-planet-backend:3001/api/health
   ```

4. **Run test script**:
   ```bash
   node test-proxy-setup.js
   ```

The configuration is now ready for deployment with the single domain proxy setup!