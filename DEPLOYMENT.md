# Dokploy Deployment Guide

## Domain Setup
- **Frontend**: householdplanetkenya.co.ke
- **Backend**: api.householdplanetkenya.co.ke

## Dokploy Deployment Steps

### 1. Deploy Backend First
1. Create new application in Dokploy
2. Connect your repository
3. Set build context: `household-planet-backend`
4. Set Dockerfile path: `Dockerfile`
5. Set domain: `api.householdplanetkenya.co.ke`
6. Add environment variables:
   ```
   PORT=3001
   JWT_SECRET=your-production-secret
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://householdplanetkenya.co.ke
   NODE_ENV=production
   ```

### 2. Deploy Frontend
1. Create new application in Dokploy
2. Connect your repository
3. Set build context: `household-planet-frontend`
4. Set Dockerfile path: `Dockerfile`
5. Set domain: `householdplanetkenya.co.ke`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.householdplanetkenya.co.ke
   ```

## Local Testing
```bash
# Test with Docker Compose
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Important Notes
- Deploy backend first to ensure API is available
- Update CORS_ORIGIN in backend to match frontend domain
- Use HTTPS in production environment variables
- Change JWT_SECRET to a secure value in production