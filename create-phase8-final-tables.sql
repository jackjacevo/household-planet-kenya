-- Phase 8 Final: Content Optimization and A/B Testing Tables

-- Blog and Content Management Tables
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "featuredImage" TEXT,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "BlogCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FAQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Search Analytics Tables
CREATE TABLE IF NOT EXISTS "SearchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "sessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- A/B Testing Tables
CREATE TABLE IF NOT EXISTS "ABExperiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL, -- BUTTON_COLOR, LAYOUT, CONTENT, PRICING, CHECKOUT
    "variants" TEXT NOT NULL, -- JSON array of variants
    "targetAudience" TEXT, -- JSON object for targeting rules
    "status" TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED, COMPLETED
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ABAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "variantName" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("experimentId") REFERENCES "ABExperiment" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "ABConversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL, -- purchase, add_to_cart, signup, page_view, etc.
    "eventValue" REAL,
    "metadata" TEXT, -- JSON object for additional data
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("experimentId") REFERENCES "ABExperiment" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("assignmentId") REFERENCES "ABAssignment" ("id") ON DELETE CASCADE
);

-- Enhanced Product and Category Tables (add SEO fields if not exists)
ALTER TABLE "Product" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN "keywords" TEXT;
ALTER TABLE "Product" ADD COLUMN "structuredData" TEXT; -- JSON-LD schema markup

ALTER TABLE "Category" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Category" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Category" ADD COLUMN "keywords" TEXT;
ALTER TABLE "Category" ADD COLUMN "seoContent" TEXT; -- Rich content for category pages

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_blogpost_slug" ON "BlogPost" ("slug");
CREATE INDEX IF NOT EXISTS "idx_blogpost_published" ON "BlogPost" ("published", "publishedAt");
CREATE INDEX IF NOT EXISTS "idx_blogpost_category" ON "BlogPost" ("categoryId");
CREATE INDEX IF NOT EXISTS "idx_page_slug" ON "Page" ("slug");
CREATE INDEX IF NOT EXISTS "idx_faq_category" ON "FAQ" ("category");
CREATE INDEX IF NOT EXISTS "idx_searchlog_query" ON "SearchLog" ("query");
CREATE INDEX IF NOT EXISTS "idx_searchlog_timestamp" ON "SearchLog" ("timestamp");
CREATE INDEX IF NOT EXISTS "idx_abassignment_experiment" ON "ABAssignment" ("experimentId");
CREATE INDEX IF NOT EXISTS "idx_abassignment_user" ON "ABAssignment" ("userId");
CREATE INDEX IF NOT EXISTS "idx_abassignment_session" ON "ABAssignment" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_abconversion_experiment" ON "ABConversion" ("experimentId");
CREATE INDEX IF NOT EXISTS "idx_abconversion_assignment" ON "ABConversion" ("assignmentId");
CREATE INDEX IF NOT EXISTS "idx_abconversion_timestamp" ON "ABConversion" ("timestamp");

-- Sample data for testing
INSERT OR IGNORE INTO "BlogCategory" ("id", "name", "slug", "description") VALUES
('blog-cat-1', 'Home & Kitchen', 'home-kitchen', 'Tips and guides for home and kitchen essentials'),
('blog-cat-2', 'Lifestyle', 'lifestyle', 'Lifestyle tips and trends'),
('blog-cat-3', 'Product Reviews', 'product-reviews', 'Detailed product reviews and comparisons');

INSERT OR IGNORE INTO "FAQ" ("id", "question", "answer", "category", "keywords", "order") VALUES
('faq-1', 'What are your delivery areas?', 'We deliver to all major cities in Kenya including Nairobi, Mombasa, Kisumu, and Nakuru. Rural areas may have extended delivery times.', 'Delivery', 'delivery,shipping,kenya,areas', 1),
('faq-2', 'How long does delivery take?', 'Standard delivery takes 1-3 business days within Nairobi and 3-7 days for other areas. Express delivery is available for same-day delivery in Nairobi.', 'Delivery', 'delivery,time,express,nairobi', 2),
('faq-3', 'What payment methods do you accept?', 'We accept M-Pesa, Airtel Money, bank transfers, and cash on delivery. Credit card payments are also available.', 'Payment', 'payment,mpesa,airtel,cash,credit card', 3),
('faq-4', 'Can I return products?', 'Yes, we offer a 30-day return policy for unused items in original packaging. Return shipping is free for defective products.', 'Returns', 'returns,refund,policy,30 days', 4),
('faq-5', 'Do you offer warranties?', 'All products come with manufacturer warranties. We also provide additional warranty coverage for selected items.', 'Warranty', 'warranty,guarantee,coverage', 5);

-- Sample A/B experiments
INSERT OR IGNORE INTO "ABExperiment" ("id", "name", "description", "type", "variants", "status") VALUES
('exp-1', 'Add to Cart Button Color Test', 'Testing different button colors for better conversion', 'BUTTON_COLOR', 
'[{"name":"control","config":{"buttonColor":"#3B82F6","buttonText":"Add to Cart"},"trafficAllocation":50},{"name":"variant_a","config":{"buttonColor":"#EF4444","buttonText":"Add to Cart"},"trafficAllocation":50}]', 
'ACTIVE'),
('exp-2', 'Homepage Hero Content Test', 'Testing different hero section content', 'CONTENT',
'[{"name":"benefit_focused","config":{"headline":"Quality Household Items Delivered Fast","subheadline":"Free delivery across Kenya. 30-day returns.","cta":"Shop Now"},"trafficAllocation":33},{"name":"product_focused","config":{"headline":"Premium Kitchen & Home Essentials","subheadline":"Discover our curated collection of household items.","cta":"Browse Products"},"trafficAllocation":33},{"name":"urgency_focused","config":{"headline":"Limited Time: 30% Off Everything","subheadline":"Hurry! Sale ends soon. Free delivery included.","cta":"Shop Sale"},"trafficAllocation":34}]',
'DRAFT');

PRAGMA foreign_keys = ON;