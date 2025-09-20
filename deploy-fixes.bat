@echo off
echo 🚀 Deploying Critical Production Fixes...
echo.

echo 📋 Critical Fixes Applied:
echo   ✅ Fixed API endpoint mismatch: /api/products/{id}/reviews → /api/reviews/product/{id}
echo   ✅ Fixed settings API methods: PUT → POST for company/notification settings  
echo   ✅ Added PUT endpoints to backend for backward compatibility
echo   ✅ Added null checks for array operations (map, reduce)
echo   ✅ Improved API response structure handling
echo   ✅ Enhanced error handling and logging
echo.

echo 🔨 Building services...
cd household-planet-backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    pause
    exit /b 1
)

cd ..\household-planet-frontend  
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

cd ..
echo ✅ All builds completed successfully!
echo.

echo 🎉 Critical fixes are ready for deployment!
echo.
echo 🔧 Fixed Issues:
echo   • 404 errors for product reviews
echo   • 404 errors for settings endpoints  
echo   • TypeError: M.map is not a function
echo   • TypeError: Cannot read properties of undefined (reading 'products')
echo   • TypeError: e.reduce is not a function
echo.
echo 📝 Next Steps:
echo   1. Deploy to production server
echo   2. Test product pages and reviews
echo   3. Test admin settings pages
echo   4. Verify cart functionality
echo   5. Monitor error logs
echo.
pause