-- File Upload Security Tables
-- Add to existing Prisma schema

-- Uploaded Files table
CREATE TABLE IF NOT EXISTS "UploadedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "userId" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedAt" DATETIME,
    "scanResult" TEXT,
    "isQuarantined" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- File Access Log table
CREATE TABLE IF NOT EXISTS "FileAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL, -- 'view', 'download', 'delete'
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "accessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("fileId") REFERENCES "UploadedFile" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- API Request Log table
CREATE TABLE IF NOT EXISTS "ApiRequestLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- Security Events table
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    "details" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_uploaded_file_user_id" ON "UploadedFile" ("userId");
CREATE INDEX IF NOT EXISTS "idx_uploaded_file_category" ON "UploadedFile" ("category");
CREATE INDEX IF NOT EXISTS "idx_uploaded_file_hash" ON "UploadedFile" ("hash");
CREATE INDEX IF NOT EXISTS "idx_file_access_log_file_id" ON "FileAccessLog" ("fileId");
CREATE INDEX IF NOT EXISTS "idx_api_request_log_user_id" ON "ApiRequestLog" ("userId");
CREATE INDEX IF NOT EXISTS "idx_api_request_log_requested_at" ON "ApiRequestLog" ("requestedAt");
CREATE INDEX IF NOT EXISTS "idx_security_event_severity" ON "SecurityEvent" ("severity");
CREATE INDEX IF NOT EXISTS "idx_security_event_created_at" ON "SecurityEvent" ("createdAt");