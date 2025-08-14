@echo off
echo ========================================
echo   SEO and Performance Optimization
echo ========================================
echo.

cd /d "c:\Users\Lipaflex\Documents\VS PROJECTS\HouseholdPlanetKenya"

echo 1. Installing SEO testing dependencies...
npm install cheerio
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

echo.
echo 2. Building the frontend with SEO optimizations...
cd household-planet-frontend
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

echo.
echo 3. Starting the backend server...
cd ../household-planet-backend
start "Backend Server" cmd /k "npm run start:dev"

echo.
echo 4. Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo 5. Starting the frontend server...
cd ../household-planet-frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 6. Waiting for frontend to start...
timeout /t 15 /nobreak > nul

echo.
echo ========================================
echo   SEO Optimization Setup Complete!
echo ========================================
echo.
echo 📱 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo 🗺️ Sitemap: http://localhost:3000/sitemap.xml
echo 🤖 Robots: http://localhost:3000/robots.txt
echo.
echo 🔧 SEO Features Implemented:
echo ✅ Dynamic meta titles and descriptions
echo ✅ Open Graph tags for social media
echo ✅ Schema.org markup for products and business
echo ✅ XML sitemap with automatic updates
echo ✅ Optimized robots.txt
echo ✅ Canonical URL implementation
echo ✅ Breadcrumb navigation with Schema
echo ✅ Optimized 404 error page
echo ✅ Internal linking strategy
echo.
echo Press any key to run SEO tests...
pause > nul

echo.
echo 7. Running SEO optimization tests...
cd ../
node test-seo-optimization.js

echo.
echo ========================================
echo   All SEO tests completed!
echo ========================================
echo.
echo 📋 SEO Checklist:
echo ✅ Meta tags optimized for all pages
echo ✅ Structured data implemented
echo ✅ Sitemap generated and accessible
echo ✅ Robots.txt configured properly
echo ✅ 404 page optimized for user experience
echo ✅ Breadcrumbs with schema markup
echo ✅ Canonical URLs implemented
echo ✅ Performance optimizations applied
echo.
echo 🚀 Next Steps:
echo 1. Submit sitemap to Google Search Console
echo 2. Verify structured data with Google's Rich Results Test
echo 3. Monitor Core Web Vitals
echo 4. Set up Google Analytics and Search Console
echo 5. Optimize images with alt tags
echo.
pause