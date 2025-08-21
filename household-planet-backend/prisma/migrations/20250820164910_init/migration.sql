/*
  Warnings:

  - You are about to drop the `ab_test_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ab_test_conversions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ab_tests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `address_verifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `analytics_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `banners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consent_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consent_withdrawals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_communications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `data_breach_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `data_deletion_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `data_export_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `data_retention_policies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deliveries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delivery_feedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delivery_status_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `faqs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `legal_agreements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `legal_document_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `low_stock_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loyalty_programs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loyalty_redemptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loyalty_rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loyalty_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_communications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_status_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recently_viewed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `return_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `return_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `search_queries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_consents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_privacy_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `whatsapp_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `sortOrder` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `order_items` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to drop the column `deliveryLocation` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPrice` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCost` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `trackingNumber` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `total` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to drop the column `brandId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `imageAltTexts` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `searchVector` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `seoDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `seoTitle` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `comparePrice` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to drop the column `isVerified` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `analyticsConsent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketingConsent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notificationSettings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `privacySettings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `users` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ab_test_assignments_testId_sessionId_key";

-- DropIndex
DROP INDEX "ab_test_assignments_testId_variant_idx";

-- DropIndex
DROP INDEX "ab_test_conversions_conversionType_idx";

-- DropIndex
DROP INDEX "ab_test_conversions_testId_variant_idx";

-- DropIndex
DROP INDEX "ab_tests_name_isActive_idx";

-- DropIndex
DROP INDEX "ab_tests_name_key";

-- DropIndex
DROP INDEX "address_verifications_addressId_key";

-- DropIndex
DROP INDEX "addresses_userId_idx";

-- DropIndex
DROP INDEX "analytics_events_timestamp_idx";

-- DropIndex
DROP INDEX "analytics_events_userId_idx";

-- DropIndex
DROP INDEX "analytics_events_sessionId_idx";

-- DropIndex
DROP INDEX "analytics_events_event_idx";

-- DropIndex
DROP INDEX "banners_position_isActive_idx";

-- DropIndex
DROP INDEX "blog_posts_isPublished_publishedAt_idx";

-- DropIndex
DROP INDEX "blog_posts_slug_idx";

-- DropIndex
DROP INDEX "blog_posts_slug_key";

-- DropIndex
DROP INDEX "brands_slug_key";

-- DropIndex
DROP INDEX "cart_userId_productId_variantId_key";

-- DropIndex
DROP INDEX "cart_userId_idx";

-- DropIndex
DROP INDEX "consent_logs_consentType_idx";

-- DropIndex
DROP INDEX "consent_logs_userId_idx";

-- DropIndex
DROP INDEX "consent_withdrawals_consentType_idx";

-- DropIndex
DROP INDEX "consent_withdrawals_userId_idx";

-- DropIndex
DROP INDEX "content_pages_slug_idx";

-- DropIndex
DROP INDEX "content_pages_slug_key";

-- DropIndex
DROP INDEX "customer_communications_type_idx";

-- DropIndex
DROP INDEX "customer_communications_profileId_idx";

-- DropIndex
DROP INDEX "customer_profiles_userId_key";

-- DropIndex
DROP INDEX "customer_tags_profileId_tag_key";

-- DropIndex
DROP INDEX "customer_tags_tag_idx";

-- DropIndex
DROP INDEX "data_breach_logs_status_idx";

-- DropIndex
DROP INDEX "data_breach_logs_severity_idx";

-- DropIndex
DROP INDEX "data_breach_logs_type_idx";

-- DropIndex
DROP INDEX "data_deletion_requests_scheduledDeletion_idx";

-- DropIndex
DROP INDEX "data_deletion_requests_status_idx";

-- DropIndex
DROP INDEX "data_deletion_requests_userId_idx";

-- DropIndex
DROP INDEX "data_export_requests_status_idx";

-- DropIndex
DROP INDEX "data_export_requests_userId_idx";

-- DropIndex
DROP INDEX "data_retention_policies_dataType_key";

-- DropIndex
DROP INDEX "deliveries_status_idx";

-- DropIndex
DROP INDEX "deliveries_trackingNumber_idx";

-- DropIndex
DROP INDEX "deliveries_trackingNumber_key";

-- DropIndex
DROP INDEX "deliveries_orderId_key";

-- DropIndex
DROP INDEX "delivery_feedback_deliveryId_key";

-- DropIndex
DROP INDEX "delivery_status_history_deliveryId_idx";

-- DropIndex
DROP INDEX "email_templates_name_idx";

-- DropIndex
DROP INDEX "email_templates_name_key";

-- DropIndex
DROP INDEX "faqs_category_isPublished_idx";

-- DropIndex
DROP INDEX "legal_agreements_status_idx";

-- DropIndex
DROP INDEX "legal_agreements_documentType_idx";

-- DropIndex
DROP INDEX "legal_agreements_userId_idx";

-- DropIndex
DROP INDEX "legal_document_requests_status_idx";

-- DropIndex
DROP INDEX "legal_document_requests_userId_idx";

-- DropIndex
DROP INDEX "low_stock_alerts_variantId_key";

-- DropIndex
DROP INDEX "loyalty_redemptions_rewardId_idx";

-- DropIndex
DROP INDEX "loyalty_redemptions_profileId_idx";

-- DropIndex
DROP INDEX "loyalty_rewards_programId_idx";

-- DropIndex
DROP INDEX "loyalty_transactions_programId_idx";

-- DropIndex
DROP INDEX "loyalty_transactions_profileId_idx";

-- DropIndex
DROP INDEX "order_communications_orderId_idx";

-- DropIndex
DROP INDEX "order_notes_orderId_idx";

-- DropIndex
DROP INDEX "order_status_history_orderId_idx";

-- DropIndex
DROP INDEX "payment_transactions_status_idx";

-- DropIndex
DROP INDEX "payment_transactions_checkoutRequestId_idx";

-- DropIndex
DROP INDEX "payment_transactions_orderId_idx";

-- DropIndex
DROP INDEX "payment_transactions_checkoutRequestId_key";

-- DropIndex
DROP INDEX "product_recommendations_productId_recommendedProductId_type_key";

-- DropIndex
DROP INDEX "product_variants_productId_idx";

-- DropIndex
DROP INDEX "product_variants_sku_key";

-- DropIndex
DROP INDEX "recently_viewed_userId_productId_key";

-- DropIndex
DROP INDEX "recently_viewed_userId_viewedAt_idx";

-- DropIndex
DROP INDEX "return_items_orderItemId_idx";

-- DropIndex
DROP INDEX "return_items_returnRequestId_idx";

-- DropIndex
DROP INDEX "return_requests_status_idx";

-- DropIndex
DROP INDEX "return_requests_orderId_idx";

-- DropIndex
DROP INDEX "return_requests_returnNumber_key";

-- DropIndex
DROP INDEX "search_queries_timestamp_idx";

-- DropIndex
DROP INDEX "search_queries_userId_idx";

-- DropIndex
DROP INDEX "search_queries_query_idx";

-- DropIndex
DROP INDEX "support_tickets_status_idx";

-- DropIndex
DROP INDEX "support_tickets_userId_idx";

-- DropIndex
DROP INDEX "support_tickets_ticketNumber_key";

-- DropIndex
DROP INDEX "ticket_messages_ticketId_idx";

-- DropIndex
DROP INDEX "user_consents_userId_key";

-- DropIndex
DROP INDEX "user_privacy_settings_userId_key";

-- DropIndex
DROP INDEX "whatsapp_messages_isOrderCandidate_idx";

-- DropIndex
DROP INDEX "whatsapp_messages_processed_idx";

-- DropIndex
DROP INDEX "whatsapp_messages_phoneNumber_idx";

-- DropIndex
DROP INDEX "whatsapp_messages_messageId_key";

-- DropIndex
DROP INDEX "wishlist_userId_productId_key";

-- DropIndex
DROP INDEX "wishlist_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ab_test_assignments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ab_test_conversions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ab_tests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "address_verifications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "addresses";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "analytics_events";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "banners";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "blog_posts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "brands";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "cart";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "consent_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "consent_withdrawals";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "content_pages";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "customer_communications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "customer_profiles";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "customer_tags";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "data_breach_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "data_deletion_requests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "data_export_requests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "data_retention_policies";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "deliveries";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "delivery_feedback";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "delivery_status_history";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "email_templates";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "faqs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "legal_agreements";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "legal_document_requests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "low_stock_alerts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "loyalty_programs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "loyalty_redemptions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "loyalty_rewards";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "loyalty_transactions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "order_communications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "order_notes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "order_status_history";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "payment_transactions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "product_recommendations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "product_variants";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "recently_viewed";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "return_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "return_requests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "search_queries";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "support_tickets";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ticket_messages";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "user_consents";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "user_privacy_settings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "whatsapp_messages";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "wishlist";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "cart_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_categories" ("description", "id", "image", "isActive", "name", "parentId", "slug") SELECT "description", "id", "image", "isActive", "name", "parentId", "slug" FROM "categories";
DROP TABLE "categories";
ALTER TABLE "new_categories" RENAME TO "categories";
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE TABLE "new_order_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_order_items" ("id", "orderId", "price", "productId", "quantity") SELECT "id", "orderId", "price", "productId", "quantity" FROM "order_items";
DROP TABLE "order_items";
ALTER TABLE "new_order_items" RENAME TO "order_items";
CREATE TABLE "new_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" REAL NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "id", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "status", "total", "updatedAt", "userId") SELECT "createdAt", "id", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "status", "total", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "comparePrice" REAL,
    "sku" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT,
    "categoryId" INTEGER NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("categoryId", "comparePrice", "createdAt", "description", "id", "images", "isActive", "isFeatured", "name", "price", "sku", "slug", "updatedAt") SELECT "categoryId", "comparePrice", "createdAt", "description", "id", "images", "isActive", "isFeatured", "name", "price", "sku", "slug", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE TABLE "new_reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("comment", "createdAt", "id", "productId", "rating", "userId") SELECT "comment", "createdAt", "id", "productId", "rating", "userId" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "password", "phone", "role", "updatedAt") SELECT "createdAt", "email", "id", "password", "phone", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");
