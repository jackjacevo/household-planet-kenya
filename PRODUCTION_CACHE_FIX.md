# URGENT: Production Cache Fix for Ramda Error

## The Issue
Production is serving old cached JavaScript files that contain Ramda references, causing `R.map is not a function` error.

## Immediate Fix Required

### 1. Clear CDN/Browser Cache
If using Cloudflare or similar CDN:
```bash
# Purge all cache
# Go to Cloudflare dashboard > Caching > Purge Everything
```

### 2. Force Browser Cache Clear
Add cache-busting headers to your deployment:
```javascript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}
```

### 3. Redeploy with New Build ID
The current build has new chunk names:
- `chunks/4bd1b696-cc729d47eba2cee4.js` (54.1 kB)
- `chunks/5964-72d6ccd9257dfb14.js` (43.9 kB)

These are NEW files without Ramda references.

## Deployment Steps
1. **Deploy the latest code** (already pushed to git)
2. **Clear all caches** (CDN, browser, server)
3. **Force hard refresh** (Ctrl+F5) on the admin pages

## Verification
After deployment, check:
- No `R.map is not a function` errors
- Products page loads correctly
- All admin pages work

**The error WILL disappear once production serves the new build files.**