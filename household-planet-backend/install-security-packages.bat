@echo off
echo Installing Phase 9 Security Packages...

cd household-planet-backend

npm install --save helmet express-rate-limit express-slow-down @nestjs/throttler csurf cookie-parser express-validator dompurify xss crypto-js compression hpp cors express-session connect-redis redis ioredis @types/cookie-parser @types/express-session

echo Security packages installed successfully!
pause