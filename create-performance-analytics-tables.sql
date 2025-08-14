-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS "PerformanceMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "loadTime" REAL NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "connectionType" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Core Web Vitals Table
CREATE TABLE IF NOT EXISTS "CoreWebVitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "lcp" REAL, -- Largest Contentful Paint
    "fid" REAL, -- First Input Delay
    "cls" REAL, -- Cumulative Layout Shift
    "fcp" REAL, -- First Contentful Paint
    "ttfb" REAL, -- Time to First Byte
    "userId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoreWebVitals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "eventLabel" TEXT,
    "eventValue" REAL,
    "userId" TEXT,
    "sessionId" TEXT,
    "url" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- E-commerce Events Table
CREATE TABLE IF NOT EXISTS "EcommerceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL, -- purchase, add_to_cart, view_item, begin_checkout
    "transactionId" TEXT,
    "productId" TEXT,
    "productName" TEXT,
    "category" TEXT,
    "quantity" INTEGER,
    "price" REAL,
    "currency" TEXT DEFAULT 'KES',
    "userId" TEXT,
    "sessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EcommerceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EcommerceEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL UNIQUE,
    "userId" TEXT,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "duration" INTEGER, -- in seconds
    "pageViews" INTEGER DEFAULT 0,
    "bounced" BOOLEAN DEFAULT false,
    "referrer" TEXT,
    "landingPage" TEXT,
    "exitPage" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Conversion Funnel Table
CREATE TABLE IF NOT EXISTS "ConversionFunnel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "step" TEXT NOT NULL, -- homepage, product_view, add_to_cart, checkout, purchase
    "stepOrder" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "productId" TEXT,
    CONSTRAINT "ConversionFunnel_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversionFunnel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConversionFunnel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- A/B Test Table
CREATE TABLE IF NOT EXISTS "ABTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testName" TEXT NOT NULL,
    "variant" TEXT NOT NULL, -- A, B, C, etc.
    "userId" TEXT,
    "sessionId" TEXT,
    "converted" BOOLEAN DEFAULT false,
    "conversionValue" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ABTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Heat Map Data Table
CREATE TABLE IF NOT EXISTS "HeatMapData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "elementSelector" TEXT,
    "eventType" TEXT NOT NULL, -- click, scroll, hover
    "x" INTEGER,
    "y" INTEGER,
    "scrollDepth" INTEGER,
    "userId" TEXT,
    "sessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HeatMapData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_performance_url" ON "PerformanceMetric"("url");
CREATE INDEX IF NOT EXISTS "idx_performance_timestamp" ON "PerformanceMetric"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_cwv_url" ON "CoreWebVitals"("url");
CREATE INDEX IF NOT EXISTS "idx_cwv_timestamp" ON "CoreWebVitals"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_analytics_event_name" ON "AnalyticsEvent"("eventName");
CREATE INDEX IF NOT EXISTS "idx_analytics_timestamp" ON "AnalyticsEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_ecommerce_event_type" ON "EcommerceEvent"("eventType");
CREATE INDEX IF NOT EXISTS "idx_ecommerce_timestamp" ON "EcommerceEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_session_start_time" ON "UserSession"("startTime");
CREATE INDEX IF NOT EXISTS "idx_funnel_session" ON "ConversionFunnel"("sessionId");
CREATE INDEX IF NOT EXISTS "idx_funnel_step" ON "ConversionFunnel"("step");
CREATE INDEX IF NOT EXISTS "idx_abtest_name" ON "ABTest"("testName");
CREATE INDEX IF NOT EXISTS "idx_heatmap_url" ON "HeatMapData"("url");

PRAGMA foreign_keys = ON;