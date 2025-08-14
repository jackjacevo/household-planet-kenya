@echo off
echo Setting up File Upload and API Security...

echo Creating upload directories...
mkdir uploads 2>nul
mkdir uploads\temp 2>nul
mkdir uploads\products 2>nul
mkdir uploads\users 2>nul
mkdir uploads\quarantine 2>nul
mkdir logs 2>nul

echo Generating Prisma client...
npx prisma generate

echo Running database migration...
npx prisma migrate dev --name "add_file_api_security"

echo File Upload and API Security setup complete!
echo.
echo Security features enabled:
echo - File type validation and restriction
echo - Virus scanning for uploaded files
echo - File size limits and storage quotas
echo - Secure file storage with access controls
echo - Image optimization and resizing
echo - API authentication and authorization
echo - Request/response logging for security monitoring
echo - API versioning and deprecation handling
echo - CORS configuration for secure cross-origin requests
echo.
pause