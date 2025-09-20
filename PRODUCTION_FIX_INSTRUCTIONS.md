# Production Fix Instructions

## Issue
The categories API endpoint `api.householdplanetkenya.co.ke/api/categories/hierarchy` is returning `ERR_CONNECTION_CLOSED`, likely due to missing category data in the production database.

## Quick Fix (Run on Dokploy Server)

### Option 1: Quick Manual Fix
1. SSH into your Dokploy server
2. Navigate to your backend container or application directory
3. Run this command:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen essentials', image: '/images/categories/kitchen.svg' },
  { name: 'Bathroom', slug: 'bathroom', description: 'Bathroom accessories', image: '/images/categories/bathroom.svg' },
  { name: 'Cleaning', slug: 'cleaning', description: 'Cleaning supplies', image: '/images/categories/cleaning.svg' },
  { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items', image: '/images/categories/decor.svg' },
  { name: 'Storage', slug: 'storage', description: 'Storage solutions', image: '/images/categories/storage.svg' }
];

async function fix() {
  try {
    const count = await prisma.category.count();
    console.log('Current categories:', count);
    
    if (count === 0) {
      for (let i = 0; i < categories.length; i++) {
        await prisma.category.create({
          data: { ...categories[i], isActive: true, sortOrder: i }
        });
        console.log('Created:', categories[i].name);
      }
    }
    
    const newCount = await prisma.category.count();
    console.log('Total categories now:', newCount);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

fix();
"
```

### Option 2: Using the Complete Fix Script
1. Copy `production-fix-complete.js` to your server
2. Run: `node production-fix-complete.js`

### Option 3: Docker Container Fix
If running in Docker:

```bash
# Enter the backend container
docker exec -it <backend-container-name> /bin/bash

# Run the quick fix
npm install @prisma/client
node -e "/* paste the quick fix code above */"

# Exit container
exit

# Restart the container
docker restart <backend-container-name>
```

## Verification Steps

1. **Check if categories were created:**
```bash
curl https://api.householdplanetkenya.co.ke/api/categories
```

2. **Test the hierarchy endpoint:**
```bash
curl https://api.householdplanetkenya.co.ke/api/categories/hierarchy
```

3. **Check application health:**
```bash
curl https://api.householdplanetkenya.co.ke/health
```

## Expected Results

After the fix:
- Categories API should return an array of category objects
- Frontend should load categories without errors
- No more `ERR_CONNECTION_CLOSED` errors

## If Issues Persist

1. **Check server logs:**
```bash
# For Docker
docker logs <backend-container-name>

# For PM2
pm2 logs

# For systemd
journalctl -u <service-name>
```

2. **Verify database connection:**
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB error:', err))
  .finally(() => prisma.\$disconnect());
"
```

3. **Check environment variables:**
```bash
echo $DATABASE_URL
echo $NODE_ENV
echo $PORT
```

## Root Cause
The production database was missing category data, causing the API to fail when the frontend tried to fetch categories for the navigation menu.

## Prevention
- Add category seeding to your deployment pipeline
- Include health checks that verify essential data exists
- Monitor API endpoints for availability