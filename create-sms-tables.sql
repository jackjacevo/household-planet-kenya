-- SMS System Tables
CREATE TABLE IF NOT EXISTS "SmsLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SmsTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SmsCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "totalRecipients" INTEGER DEFAULT 0,
    "successfulSends" INTEGER DEFAULT 0,
    "failedSends" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add SMS preferences to User table if not exists
ALTER TABLE "User" ADD COLUMN "smsOptIn" BOOLEAN DEFAULT true;
ALTER TABLE "User" ADD COLUMN "smsPreferences" TEXT;

-- Add notification flags to WishlistItem if not exists
ALTER TABLE "WishlistItem" ADD COLUMN "notificationSent" BOOLEAN DEFAULT false;

-- Insert default SMS templates
INSERT OR IGNORE INTO "SmsTemplate" ("id", "name", "type", "template") VALUES
('sms-order-confirm', 'order_confirmation', 'ORDER_CONFIRMATION', 'Order confirmed! #{{orderNumber}} - KSh {{total}}. Track: {{trackingUrl}}'),
('sms-payment-confirm', 'payment_confirmation', 'PAYMENT_CONFIRMATION', 'Payment received! KSh {{amount}} via {{method}} for order #{{orderNumber}}. Thank you!'),
('sms-shipping', 'shipping_notification', 'SHIPPING_NOTIFICATION', 'Your order #{{orderNumber}} has shipped! {{trackingInfo}} Delivery in 1-3 days.'),
('sms-delivery', 'delivery_notification', 'DELIVERY_NOTIFICATION', 'Your order #{{orderNumber}} {{deliveryMessage}} Please be available.'),
('sms-otp', 'otp_verification', 'OTP', 'Your Household Planet Kenya verification code is: {{otp}}. Valid for 10 minutes. Do not share.'),
('sms-wishlist', 'wishlist_alert', 'WISHLIST_ALERT', 'Good news! {{productName}} is back in stock. Order now: {{shopUrl}}'),
('sms-delivery-reminder', 'delivery_reminder', 'DELIVERY_REMINDER', 'Reminder: Your order #{{orderNumber}} is scheduled for delivery on {{deliveryDate}}. Please be available.'),
('sms-promotional', 'promotional', 'PROMOTIONAL', '🎉 Special offer from Household Planet Kenya! {{offerDetails}} Shop now: {{shopUrl}}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_sms_log_phone" ON "SmsLog"("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_sms_log_type" ON "SmsLog"("type");
CREATE INDEX IF NOT EXISTS "idx_sms_log_status" ON "SmsLog"("status");
CREATE INDEX IF NOT EXISTS "idx_otp_code_phone" ON "OtpCode"("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_otp_code_expires" ON "OtpCode"("expiresAt");
CREATE INDEX IF NOT EXISTS "idx_sms_campaign_status" ON "SmsCampaign"("status");

PRAGMA foreign_keys = ON;