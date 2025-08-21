/*
  Warnings:

  - You are about to alter the column `userId` on the `consent_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `actions` on the `data_breach_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `userId` on the `data_deletion_requests` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `data_export_requests` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `cookieConsent` on the `user_consents` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `userId` on the `user_consents` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `user_privacy_settings` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- CreateTable
CREATE TABLE "legal_agreements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "agreedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "legal_document_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "consent_withdrawals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "reason" TEXT,
    "withdrawnAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_consent_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "consentType" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "purpose" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consent_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_consent_logs" ("consentType", "createdAt", "granted", "id", "ipAddress", "purpose", "userAgent", "userId") SELECT "consentType", "createdAt", "granted", "id", "ipAddress", "purpose", "userAgent", "userId" FROM "consent_logs";
DROP TABLE "consent_logs";
ALTER TABLE "new_consent_logs" RENAME TO "consent_logs";
CREATE INDEX "consent_logs_userId_idx" ON "consent_logs"("userId");
CREATE INDEX "consent_logs_consentType_idx" ON "consent_logs"("consentType");
CREATE TABLE "new_data_breach_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedUsers" INTEGER NOT NULL DEFAULT 0,
    "reportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'reported',
    "actions" JSONB
);
INSERT INTO "new_data_breach_logs" ("actions", "affectedUsers", "description", "id", "reportedAt", "resolvedAt", "severity", "status", "type") SELECT "actions", "affectedUsers", "description", "id", "reportedAt", "resolvedAt", "severity", "status", "type" FROM "data_breach_logs";
DROP TABLE "data_breach_logs";
ALTER TABLE "new_data_breach_logs" RENAME TO "data_breach_logs";
CREATE INDEX "data_breach_logs_type_idx" ON "data_breach_logs"("type");
CREATE INDEX "data_breach_logs_severity_idx" ON "data_breach_logs"("severity");
CREATE INDEX "data_breach_logs_status_idx" ON "data_breach_logs"("status");
CREATE TABLE "new_data_deletion_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledDeletion" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "data_deletion_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_data_deletion_requests" ("completedAt", "createdAt", "id", "reason", "scheduledDeletion", "status", "userId") SELECT "completedAt", "createdAt", "id", "reason", "scheduledDeletion", "status", "userId" FROM "data_deletion_requests";
DROP TABLE "data_deletion_requests";
ALTER TABLE "new_data_deletion_requests" RENAME TO "data_deletion_requests";
CREATE INDEX "data_deletion_requests_userId_idx" ON "data_deletion_requests"("userId");
CREATE INDEX "data_deletion_requests_status_idx" ON "data_deletion_requests"("status");
CREATE INDEX "data_deletion_requests_scheduledDeletion_idx" ON "data_deletion_requests"("scheduledDeletion");
CREATE TABLE "new_data_export_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "exportData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "data_export_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_data_export_requests" ("completedAt", "createdAt", "exportData", "id", "reason", "status", "userId") SELECT "completedAt", "createdAt", "exportData", "id", "reason", "status", "userId" FROM "data_export_requests";
DROP TABLE "data_export_requests";
ALTER TABLE "new_data_export_requests" RENAME TO "data_export_requests";
CREATE INDEX "data_export_requests_userId_idx" ON "data_export_requests"("userId");
CREATE INDEX "data_export_requests_status_idx" ON "data_export_requests"("status");
CREATE TABLE "new_user_consents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "cookieConsent" JSONB NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_consents" ("consentVersion", "cookieConsent", "createdAt", "id", "ipAddress", "updatedAt", "userAgent", "userId") SELECT "consentVersion", "cookieConsent", "createdAt", "id", "ipAddress", "updatedAt", "userAgent", "userId" FROM "user_consents";
DROP TABLE "user_consents";
ALTER TABLE "new_user_consents" RENAME TO "user_consents";
CREATE UNIQUE INDEX "user_consents_userId_key" ON "user_consents"("userId");
CREATE TABLE "new_user_privacy_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "profileVisibility" BOOLEAN NOT NULL DEFAULT true,
    "dataProcessing" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "analyticsTracking" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_privacy_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_privacy_settings" ("analyticsTracking", "createdAt", "dataProcessing", "id", "marketingEmails", "profileVisibility", "updatedAt", "userId") SELECT "analyticsTracking", "createdAt", "dataProcessing", "id", "marketingEmails", "profileVisibility", "updatedAt", "userId" FROM "user_privacy_settings";
DROP TABLE "user_privacy_settings";
ALTER TABLE "new_user_privacy_settings" RENAME TO "user_privacy_settings";
CREATE UNIQUE INDEX "user_privacy_settings_userId_key" ON "user_privacy_settings"("userId");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "verificationToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatar" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "notificationSettings" JSONB,
    "privacySettings" JSONB,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "analyticsConsent" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("avatar", "createdAt", "dateOfBirth", "email", "emailVerified", "gender", "id", "name", "notificationSettings", "password", "phone", "phoneVerified", "privacySettings", "resetToken", "resetTokenExpiry", "role", "updatedAt", "verificationToken") SELECT "avatar", "createdAt", "dateOfBirth", "email", "emailVerified", "gender", "id", "name", "notificationSettings", "password", "phone", "phoneVerified", "privacySettings", "resetToken", "resetTokenExpiry", "role", "updatedAt", "verificationToken" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "legal_agreements_userId_idx" ON "legal_agreements"("userId");

-- CreateIndex
CREATE INDEX "legal_agreements_documentType_idx" ON "legal_agreements"("documentType");

-- CreateIndex
CREATE INDEX "legal_agreements_status_idx" ON "legal_agreements"("status");

-- CreateIndex
CREATE INDEX "legal_document_requests_userId_idx" ON "legal_document_requests"("userId");

-- CreateIndex
CREATE INDEX "legal_document_requests_status_idx" ON "legal_document_requests"("status");

-- CreateIndex
CREATE INDEX "consent_withdrawals_userId_idx" ON "consent_withdrawals"("userId");

-- CreateIndex
CREATE INDEX "consent_withdrawals_consentType_idx" ON "consent_withdrawals"("consentType");
