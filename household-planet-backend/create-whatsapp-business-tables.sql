-- WhatsApp Business Settings Table
CREATE TABLE IF NOT EXISTS "WhatsAppBusinessSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessHours" TEXT,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessageEnabled" BOOLEAN NOT NULL DEFAULT true,
    "businessName" TEXT,
    "businessDescription" TEXT,
    "businessAddress" TEXT,
    "businessWebsite" TEXT,
    "businessEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Auto Reply Table
CREATE TABLE IF NOT EXISTS "WhatsAppAutoReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL UNIQUE,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerKeywords" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Customer Segments Table
CREATE TABLE IF NOT EXISTS "WhatsAppCustomerSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customerCount" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Campaigns Table
CREATE TABLE IF NOT EXISTS "WhatsAppCampaign" (
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
    "totalRecipients" INTEGER DEFAULT 0,
    "successfulSends" INTEGER DEFAULT 0,
    "failedSends" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppCampaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "WhatsAppCustomerSegment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- WhatsApp Contacts Table (Enhanced)
CREATE TABLE IF NOT EXISTS "WhatsAppContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "userId" TEXT,
    "isOptedIn" BOOLEAN NOT NULL DEFAULT true,
    "optedInAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "optedOutAt" DATETIME,
    "lastMessageAt" DATETIME,
    "totalMessages" INTEGER DEFAULT 0,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- WhatsApp Message Analytics Table
CREATE TABLE IF NOT EXISTS "WhatsAppMessageAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "campaignId" TEXT,
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    "repliedAt" DATETIME,
    "clickedAt" DATETIME,
    "isDelivered" BOOLEAN DEFAULT false,
    "isRead" BOOLEAN DEFAULT false,
    "isReplied" BOOLEAN DEFAULT false,
    "isClicked" BOOLEAN DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppMessageAnalytics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "WhatsAppCampaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- WhatsApp Conversation Threads Table
CREATE TABLE IF NOT EXISTS "WhatsAppConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "userId" TEXT,
    "contactId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" DATETIME,
    "messageCount" INTEGER DEFAULT 0,
    "isAssigned" BOOLEAN DEFAULT false,
    "assignedTo" TEXT,
    "tags" TEXT,
    "priority" TEXT DEFAULT 'NORMAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppConversation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "WhatsAppContact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WhatsAppConversation_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- WhatsApp Quick Replies Table
CREATE TABLE IF NOT EXISTS "WhatsAppQuickReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsAppQuickReply_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- WhatsApp Webhook Events Table
CREATE TABLE IF NOT EXISTS "WhatsAppWebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "messageId" TEXT,
    "payload" TEXT NOT NULL,
    "processed" BOOLEAN DEFAULT false,
    "processedAt" DATETIME,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default auto-reply messages
INSERT OR IGNORE INTO "WhatsAppAutoReply" ("id", "type", "message") VALUES
('auto-reply-1', 'business_hours', 'Thank you for contacting Household Planet Kenya! We are currently open and will respond to your message shortly. Our business hours are Monday-Friday 8AM-6PM, Saturday 9AM-5PM.'),
('auto-reply-2', 'after_hours', 'Thank you for contacting Household Planet Kenya! We are currently closed. Our business hours are Monday-Friday 8AM-6PM, Saturday 9AM-5PM. We will respond to your message during our next business hours.'),
('auto-reply-3', 'welcome', 'Welcome to Household Planet Kenya! 🏠✨ We are your one-stop shop for quality household items. How can we help you today?');

-- Insert default quick replies
INSERT OR IGNORE INTO "WhatsAppQuickReply" ("id", "title", "message", "category") VALUES
('quick-1', 'Business Hours', 'Our business hours are:\nMonday-Friday: 8AM-6PM\nSaturday: 9AM-5PM\nSunday: Closed\n\nWe respond to messages during business hours.', 'General'),
('quick-2', 'Delivery Info', 'We offer delivery throughout Kenya:\n🚚 Nairobi: Same day delivery\n📦 Other counties: 1-3 business days\n💰 Free delivery on orders over KSh 2,000', 'Delivery'),
('quick-3', 'Payment Methods', 'We accept:\n💳 M-Pesa\n🏦 Bank Transfer\n💰 Cash on Delivery\n🌍 International Cards (Visa, Mastercard)', 'Payment'),
('quick-4', 'Return Policy', 'We offer 7-day returns on most items:\n✅ Items must be unused\n📦 Original packaging required\n🔄 Exchange or refund available\n📞 Contact us to initiate return', 'Returns'),
('quick-5', 'Track Order', 'To track your order:\n1️⃣ Visit: https://householdplanet.co.ke/orders\n2️⃣ Enter your order number\n3️⃣ View real-time status\n\nOr share your order number and we will check for you!', 'Orders');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_whatsapp_contact_phone" ON "WhatsAppContact"("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_contact_user" ON "WhatsAppContact"("userId");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_contact_opted_in" ON "WhatsAppContact"("isOptedIn");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_campaign_status" ON "WhatsAppCampaign"("status");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_campaign_scheduled" ON "WhatsAppCampaign"("scheduledAt");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_conversation_phone" ON "WhatsAppConversation"("phoneNumber");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_conversation_status" ON "WhatsAppConversation"("status");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_analytics_message" ON "WhatsAppMessageAnalytics"("messageId");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_analytics_campaign" ON "WhatsAppMessageAnalytics"("campaignId");
CREATE INDEX IF NOT EXISTS "idx_whatsapp_webhook_processed" ON "WhatsAppWebhookEvent"("processed");

PRAGMA foreign_keys = ON;