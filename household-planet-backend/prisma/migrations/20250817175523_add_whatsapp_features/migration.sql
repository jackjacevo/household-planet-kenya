-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "messageId" TEXT,
    "isOrderCandidate" BOOLEAN NOT NULL DEFAULT false,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "orderId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL NOT NULL,
    "shippingCost" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "deliveryLocation" TEXT,
    "deliveryPrice" DECIMAL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "tags" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "deliveryLocation", "deliveryPrice", "id", "orderNumber", "paymentMethod", "paymentStatus", "priority", "shippingAddress", "shippingCost", "status", "subtotal", "tags", "total", "trackingNumber", "updatedAt", "userId") SELECT "createdAt", "deliveryLocation", "deliveryPrice", "id", "orderNumber", "paymentMethod", "paymentStatus", "priority", "shippingAddress", "shippingCost", "status", "subtotal", "tags", "total", "trackingNumber", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_trackingNumber_idx" ON "orders"("trackingNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_messages_messageId_key" ON "whatsapp_messages"("messageId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_phoneNumber_idx" ON "whatsapp_messages"("phoneNumber");

-- CreateIndex
CREATE INDEX "whatsapp_messages_processed_idx" ON "whatsapp_messages"("processed");

-- CreateIndex
CREATE INDEX "whatsapp_messages_isOrderCandidate_idx" ON "whatsapp_messages"("isOrderCandidate");
