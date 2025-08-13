# Phase 5 Troubleshooting Guide

## 🚨 Current Issue: ChunkLoadError

**Problem**: Frontend is trying to load chunks from wrong port (3001 instead of 3000)

## ✅ Solution Steps

### Step 1: Stop All Running Servers
```bash
# Press Ctrl+C in all terminal windows running servers
# Or close all terminal windows
```

### Step 2: Restart Backend on Correct Port (3001)
```bash
cd household-planet-backend
npm run start:dev
```
**Expected Output**: `Backend running on http://localhost:3001`

### Step 3: Restart Frontend on Port 3000
```bash
cd household-planet-frontend
npm run dev
```
**Expected Output**: `ready - started server on 0.0.0.0:3000`

### Step 4: Clear Browser Cache
1. Open browser developer tools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or use Ctrl+Shift+R

## 🔧 Quick Fix Script

Use the provided startup script:
```bash
start-servers.bat
```

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:3000
- [ ] No port conflicts
- [ ] Browser cache cleared
- [ ] No console errors

## 🌐 Expected URLs

- **Frontend Homepage**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api

## 🐛 Common Issues & Fixes

### Issue 1: Port Already in Use
```bash
# Kill processes using the ports
taskkill /f /im node.exe
# Wait 5 seconds, then restart servers
```

### Issue 2: ChunkLoadError
- Clear browser cache completely
- Restart both servers
- Check network tab in developer tools

### Issue 3: CORS Errors
- Verify backend CORS is set to allow localhost:3000
- Check that frontend is making requests to localhost:3001

### Issue 4: Module Not Found
```bash
# Reinstall dependencies
cd household-planet-frontend
npm install
cd ../household-planet-backend
npm install
```

## 📱 Test Phase 5 Features

Once servers are running, test these features:

1. **Homepage Loading**: Visit http://localhost:3000
2. **Hero Carousel**: Should rotate images automatically
3. **Categories**: Should display all 13 categories
4. **Best Sellers**: Should load products (API or fallback)
5. **Contact Links**: Phone and email should be clickable
6. **Social Media**: Sticky icons should appear on right side
7. **Newsletter**: Should accept email input
8. **Responsive**: Test on mobile view

## 🎯 Success Indicators

✅ Homepage loads without errors  
✅ All images display correctly  
✅ Animations are smooth  
✅ Contact information is clickable  
✅ No console errors  
✅ Responsive design works  

## 📞 Support

If issues persist:
- Check console logs in browser (F12)
- Verify both servers are running on correct ports
- Ensure no firewall blocking localhost connections

**Contact**: +254 790 227 760 | householdplanet819@gmail.com