@echo off
echo Installing file upload security packages...

npm install --save ^
  multer ^
  sharp ^
  file-type ^
  @aws-sdk/client-s3 ^
  @aws-sdk/s3-request-presigner ^
  node-clamav ^
  express-fileupload ^
  mime-types ^
  @nestjs/swagger ^
  swagger-ui-express ^
  winston ^
  winston-daily-rotate-file ^
  express-slow-down

npm install --save-dev ^
  @types/multer ^
  @types/mime-types ^
  @types/express-fileupload

echo File security packages installed successfully!
pause