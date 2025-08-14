/*
  Warnings:

  - You are about to drop the column `keyword` on the `whatsapp_auto_replies` table. All the data in the column will be lost.
  - Added the required column `type` to the `whatsapp_auto_replies` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_whatsapp_auto_replies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_whatsapp_auto_replies" ("createdAt", "id", "isActive", "message", "updatedAt") SELECT "createdAt", "id", "isActive", "message", "updatedAt" FROM "whatsapp_auto_replies";
DROP TABLE "whatsapp_auto_replies";
ALTER TABLE "new_whatsapp_auto_replies" RENAME TO "whatsapp_auto_replies";
CREATE UNIQUE INDEX "whatsapp_auto_replies_type_key" ON "whatsapp_auto_replies"("type");
CREATE TABLE "new_whatsapp_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "segmentId" TEXT,
    "phoneNumbers" TEXT,
    "mediaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "completedAt" DATETIME,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "successfulSends" INTEGER NOT NULL DEFAULT 0,
    "failedSends" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "whatsapp_campaigns_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "whatsapp_customer_segments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_whatsapp_campaigns" ("createdAt", "id", "message", "name", "scheduledAt", "segmentId", "sentAt", "status", "totalDelivered", "totalFailed", "totalSent", "updatedAt") SELECT "createdAt", "id", "message", "name", "scheduledAt", "segmentId", "sentAt", "status", "totalDelivered", "totalFailed", "totalSent", "updatedAt" FROM "whatsapp_campaigns";
DROP TABLE "whatsapp_campaigns";
ALTER TABLE "new_whatsapp_campaigns" RENAME TO "whatsapp_campaigns";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
