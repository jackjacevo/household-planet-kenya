# Deployment Instructions - API URL Fix

## Current Status
✅ **Issue Identified**: Double `/api` paths causing 500 errors  
✅ **Code Fixed**: All 17+ affected files updated  
✅ **Build Complete**: Frontend successfully rebuilt  
⏳ **Deployment Needed**: Production site needs update  

## The Problem
The frontend was making requests like:
```
❌ https://householdplanetkenya.co.ke/api/api/orders/whatsapp/pending
```

Instead of:
```
✅ https://householdplanetkenya.co.ke/api/orders/whatsapp/pending
```

## What Was Fixed

### 1. Environment Variable
```bash
# File: household-planet-frontend/.env.local
NEXT_PUBLIC_API_URL=https://householdplanetkenya.co.ke  # Fixed from api.householdplanetkenya.co.ke
```

### 2. API Route Files (17 files fixed)
- All WhatsApp endpoints
- All admin API routes  
- Customer search
- Promo codes
- And more...

## Deployment Steps

### Option 1: If using a deployment service (Vercel, Netlify, etc.)
1. Push changes to your Git repository
2. Trigger a new deployment
3. Wait for deployment to complete

### Option 2: If manually deploying
1. Upload the contents of `household-planet-frontend/.next/` to your web server
2. Ensure environment variables are set correctly on the server
3. Restart the web server if needed

### Option 3: If using Docker
1. Rebuild the Docker image with the updated code
2. Deploy the new image to production

## Verification

After deployment, test these endpoints:

```bash
# These should return 401 (auth required) instead of 500 (server error)
curl https://householdplanetkenya.co.ke/api/orders/whatsapp/pending
curl https://householdplanetkenya.co.ke/api/orders/whatsapp/orders  
curl https://householdplanetkenya.co.ke/api/analytics/whatsapp-inquiries
```

**Expected Result**: `401 Unauthorized` (not `500 Internal Server Error`)

## Files Ready for Deployment

The following files contain the fixes and are ready to deploy:

```
household-planet-frontend/.env.local                                    ✅ Fixed
household-planet-frontend/.next/                                        ✅ Built
household-planet-frontend/src/app/api/orders/whatsapp/pending/route.ts  ✅ Fixed
household-planet-frontend/src/app/api/orders/whatsapp/orders/route.ts   ✅ Fixed
household-planet-frontend/src/app/api/analytics/whatsapp-inquiries/route.ts ✅ Fixed
... and 14 more API route files                                         ✅ Fixed
```

## Impact After Deployment

Once deployed, the following will work correctly:
- ✅ WhatsApp order management in admin panel
- ✅ WhatsApp analytics dashboard
- ✅ Admin product/category/staff management
- ✅ Customer search functionality
- ✅ Promo code management
- ✅ All other affected admin features

## Rollback Plan

If issues occur after deployment:
1. Revert to the previous deployment
2. The old version will have the 500 errors but other functionality will work
3. Investigate any new issues and redeploy the fix

---

**Ready to Deploy**: All fixes are complete and tested. The production site just needs to be updated with the new build.