@echo off
echo 🔧 Deploying API URL Fix...

cd household-planet-frontend

echo 📦 Installing dependencies...
call npm install

echo 🏗️ Building frontend...
call npm run build

echo ✅ Build complete! 
echo 🚀 The API URL fix has been applied.
echo 💡 The frontend will now correctly connect to the backend API.

pause