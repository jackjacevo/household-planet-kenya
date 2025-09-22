# Fix for Upload 404 Errors

## Problems
1. Frontend POST to `/api/upload/category` returns 404
2. Frontend POST to `/api/upload/product` returns 404

## Root Cause
The upload controller routes exist but don't work for POST requests. The working endpoints are:
1. Category uploads: `/api/admin/categories/upload-image`
2. Product uploads: `/api/admin/products/temp/images`

## Solutions

### Frontend Updates (Recommended)
1. **Category uploads:** Change `/api/upload/category` → `/api/admin/categories/upload-image`
2. **Product uploads:** Change `/api/upload/product` → `/api/admin/products/temp/images`

### Parameter Names
- Category endpoint expects: `image` parameter
- Product endpoint expects: `images` parameter (multiple files)

## Quick Fix
Update frontend to use the working admin endpoints:
- Categories: `/api/admin/categories/upload-image`
- Products: `/api/admin/products/temp/images`

## Test Commands
```bash
# Test working endpoint
curl -X OPTIONS https://api.householdplanetkenya.co.ke/api/admin/categories/upload-image

# Test problematic endpoint  
curl -X OPTIONS https://api.householdplanetkenya.co.ke/api/upload/category
```

## Implementation
1. Find the frontend component making the `/api/upload/category` request
2. Update it to use `/api/admin/categories/upload-image`
3. Ensure proper authentication headers are included
4. Update parameter name from 'file' to 'image' if needed