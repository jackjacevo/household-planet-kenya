# Dokploy Production Fix Commands

## The Issue
Your production database is missing categories, causing the API endpoint `api.householdplanetkenya.co.ke/api/categories/hierarchy` to fail.

## Quick Fix (Run in Dokploy Terminal)

### Step 1: Access Backend Container
```bash
docker exec -it householdplanetbackend-backend-polxg0 /bin/bash
```

### Step 2: Run Database Migration & Seed
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run the seed
npx prisma db seed
```

### Step 3: Exit and Restart
```bash
exit
docker restart householdplanetbackend-backend-polxg0
```

### Step 4: Test the Fix
```bash
curl https://api.householdplanetkenya.co.ke/api/categories/hierarchy
```

## Alternative: One-Line Fix
If the above doesn't work, run this inside the container:

```bash
docker exec -it householdplanetbackend-backend-polxg0 node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const cats = [
    { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen appliances, cookware, and dining essentials', isActive: true, sortOrder: 0 },
    { name: 'Home Cleaning', slug: 'home-cleaning', description: 'Cleaning supplies and equipment', isActive: true, sortOrder: 1 },
    { name: 'Bathroom Essentials', slug: 'bathroom-essentials', description: 'Bathroom accessories and toiletries', isActive: true, sortOrder: 2 },
    { name: 'Storage & Organization', slug: 'storage-organization', description: 'Storage solutions and organizers', isActive: true, sortOrder: 3 },
    { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items and home accessories', isActive: true, sortOrder: 4 }
  ];
  for (const cat of cats) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    console.log('Created:', cat.name);
  }
  console.log('Done! Categories:', await prisma.category.count());
  await prisma.\$disconnect();
})();
"
```

## Expected Result
After running the fix, you should see:
- Categories API returns an array of category objects
- Frontend loads without `ERR_CONNECTION_CLOSED` errors
- Navigation menu displays properly

## Verification
Test these endpoints:
- `https://api.householdplanetkenya.co.ke/health` - Should return 200 OK
- `https://api.householdplanetkenya.co.ke/api/categories` - Should return categories array
- `https://api.householdplanetkenya.co.ke/api/categories/hierarchy` - Should return hierarchy

The issue is simply that your production database needs to be seeded with the category data that your frontend expects.