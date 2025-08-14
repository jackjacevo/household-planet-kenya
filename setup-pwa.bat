@echo off
echo ========================================
echo    PWA Setup - Household Planet Kenya
echo ========================================
echo.

echo 🚀 Setting up Progressive Web App...
echo.

echo 📦 Installing backend dependencies...
cd household-planet-backend
call npm install web-push
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo 🔑 Generating VAPID keys for push notifications...
echo.
echo Please save these keys securely:
echo.
call npx web-push generate-vapid-keys
echo.

echo 📝 Please update your .env files with the VAPID keys above:
echo.
echo Backend (.env):
echo VAPID_PUBLIC_KEY=your_public_key_here
echo VAPID_PRIVATE_KEY=your_private_key_here
echo VAPID_SUBJECT=mailto:admin@householdplanet.co.ke
echo.
echo Frontend (.env.local):
echo NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
echo.

echo 🗄️  Setting up database tables...
echo.
sqlite3 prisma/dev.db "CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subscription TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);"

if %errorlevel% neq 0 (
    echo ⚠️  Database table creation failed - table may already exist
)

cd ..

echo.
echo 🧪 Running PWA tests...
echo.
node test-pwa-complete.js

echo.
echo ✅ PWA setup complete!
echo.
echo 📋 Next steps:
echo 1. Update your .env files with the VAPID keys shown above
echo 2. Start both servers: npm run dev (frontend) and npm run start:dev (backend)
echo 3. Test the PWA features in your browser
echo 4. Test installation on mobile devices
echo.
echo 📖 For detailed setup instructions, see PWA_SETUP_GUIDE.md
echo.
pause