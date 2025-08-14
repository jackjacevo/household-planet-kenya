-- Live Chat System Tables
CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "lastActivityAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatSession_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isFromCustomer" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ChatAutoResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keywords" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OfflineMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email Marketing System Tables
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "templateName" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EmailCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "totalRecipients" INTEGER DEFAULT 0,
    "successfulSends" INTEGER DEFAULT 0,
    "failedSends" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "EmailSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "userId" TEXT,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" DATETIME,
    "preferences" TEXT,
    CONSTRAINT "EmailSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Insert default chat auto-responses
INSERT OR IGNORE INTO "ChatAutoResponse" ("id", "keywords", "response", "priority") VALUES
('auto-1', 'hello,hi,hey', 'Hello! Welcome to Household Planet Kenya. How can I help you today?', 1),
('auto-2', 'hours,time,open', 'Our business hours are Monday-Friday 8AM-6PM, Saturday 9AM-5PM. We are closed on Sundays.', 2),
('auto-3', 'delivery,shipping', 'We offer delivery throughout Kenya. Nairobi: Same day delivery. Other counties: 1-3 business days. Free delivery on orders over KSh 2,000.', 3),
('auto-4', 'payment,pay', 'We accept M-Pesa, Bank Transfer, Cash on Delivery, and International Cards (Visa, Mastercard).', 4),
('auto-5', 'return,refund', 'We offer 7-day returns on most items. Items must be unused with original packaging. Contact us to initiate a return.', 5),
('auto-6', 'track,order', 'To track your order, visit our website and enter your order number, or share it with me and I will check for you.', 6);

-- Insert default email templates
INSERT OR IGNORE INTO "EmailTemplate" ("id", "name", "subject", "content", "type") VALUES
('tpl-welcome', 'welcome', 'Welcome to Household Planet Kenya!', 
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px; text-align: center;">
<h1 style="color: #2563eb;">Welcome to Household Planet Kenya!</h1>
<p>Hi {{userName}},</p>
<p>Thank you for joining our family! We are excited to help you find the perfect household items.</p>
<p>Get 15% off your first order with code: <strong>WELCOME15</strong></p>
<a href="{{shopUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Start Shopping</a>
<p>Happy shopping!<br>The Household Planet Kenya Team</p>
</div></body></html>', 'welcome'),

('tpl-order-confirm', 'order_confirmation', 'Order Confirmation #{{orderNumber}}',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #16a34a;">Order Confirmed!</h1>
<p>Hi {{customerName}},</p>
<p>Thank you for your order! We have received your order and are processing it.</p>
<div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
<h3>Order #{{orderNumber}}</h3>
<p><strong>Total: KSh {{orderTotal}}</strong></p>
</div>
<a href="{{trackingUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Order</a>
<p>We will notify you when your order ships.</p>
</div></body></html>', 'order'),

('tpl-abandoned-1', 'abandoned_cart_1', 'You left something in your cart',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #dc2626;">Don\'t forget your cart!</h1>
<p>Hi {{customerName}},</p>
<p>You left some great items in your cart. Complete your purchase now!</p>
<a href="{{cartUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Complete Purchase</a>
<p>Free delivery on orders over KSh 2,000!</p>
</div></body></html>', 'abandoned_cart'),

('tpl-abandoned-2', 'abandoned_cart_2', 'Still thinking about your cart?',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #dc2626;">Still interested?</h1>
<p>Hi {{customerName}},</p>
<p>Your cart is still waiting for you. Don\'t miss out on these great items!</p>
<a href="{{cartUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Complete Purchase</a>
<p>Questions? Reply to this email or chat with us on our website.</p>
</div></body></html>', 'abandoned_cart'),

('tpl-abandoned-3', 'abandoned_cart_3', 'Last chance - 15% off your cart!',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #dc2626;">Last Chance - 15% OFF!</h1>
<p>Hi {{customerName}},</p>
<p>This is your final reminder about your cart. Get 15% off with code: <strong>SAVE15</strong></p>
<a href="{{cartUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Get 15% Off Now</a>
<p>This offer expires in 24 hours!</p>
</div></body></html>', 'abandoned_cart'),

('tpl-shipping', 'shipping_notification', 'Your order #{{orderNumber}} has shipped!',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #16a34a;">Your order is on the way!</h1>
<p>Hi {{customerName}},</p>
<p>Great news! Your order #{{orderNumber}} has been shipped.</p>
<div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
<p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
<p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
</div>
<a href="{{trackingUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Package</a>
</div></body></html>', 'shipping'),

('tpl-delivered', 'delivery_confirmation', 'Order #{{orderNumber}} delivered!',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #16a34a;">Order Delivered!</h1>
<p>Hi {{customerName}},</p>
<p>Your order #{{orderNumber}} has been successfully delivered!</p>
<p>We hope you love your purchase. Please take a moment to review your items.</p>
<a href="{{reviewUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Leave a Review</a>
<p>Thank you for shopping with us!</p>
</div></body></html>', 'delivery'),

('tpl-review', 'review_reminder', 'How was your recent purchase?',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #2563eb;">How did we do?</h1>
<p>Hi {{customerName}},</p>
<p>We hope you are enjoying your recent purchase from order #{{orderNumber}}.</p>
<p>Your feedback helps us improve and helps other customers make informed decisions.</p>
<a href="{{reviewUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Leave a Review</a>
<p>Thank you for your time!</p>
</div></body></html>', 'review'),

('tpl-birthday', 'birthday_offer', 'Happy Birthday! Special offer inside 🎉',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px; text-align: center;">
<h1 style="color: #dc2626;">🎉 Happy Birthday {{customerName}}! 🎉</h1>
<p>It\'s your special day and we want to celebrate with you!</p>
<p>Enjoy 20% off your next purchase with code: <strong>{{discountCode}}</strong></p>
<a href="{{shopUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Shop Now</a>
<p>Valid for 7 days. Happy Birthday from all of us at Household Planet Kenya!</p>
</div></body></html>', 'birthday'),

('tpl-newsletter', 'newsletter', 'New Products & Special Offers',
'<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<div style="background: #f8f9fa; padding: 20px;">
<h1 style="color: #2563eb;">What\'s New at Household Planet Kenya</h1>
<p>Hi {{customerName}},</p>
<p>Check out our latest products and special offers!</p>
<div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
<h3>Featured Products</h3>
<p>Discover our newest household essentials</p>
</div>
<a href="{{shopUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a>
<p>Thank you for being a valued customer!</p>
</div></body></html>', 'newsletter');

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_chat_session_visitor" ON "ChatSession"("visitorId");
CREATE INDEX IF NOT EXISTS "idx_chat_session_status" ON "ChatSession"("status");
CREATE INDEX IF NOT EXISTS "idx_chat_message_session" ON "ChatMessage"("sessionId");
CREATE INDEX IF NOT EXISTS "idx_email_log_status" ON "EmailLog"("status");
CREATE INDEX IF NOT EXISTS "idx_email_subscription_email" ON "EmailSubscription"("email");

PRAGMA foreign_keys = ON;