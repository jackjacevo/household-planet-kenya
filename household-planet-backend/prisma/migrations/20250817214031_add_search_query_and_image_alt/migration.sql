-- AlterTable
ALTER TABLE "products" ADD COLUMN "imageAltTexts" TEXT;

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "pageUrl" TEXT
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "variants" JSONB NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ab_test_assignments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testId" INTEGER NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ab_test_assignments_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ab_tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ab_test_conversions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "conversionType" TEXT NOT NULL,
    "value" DECIMAL,
    "convertedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ab_test_conversions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ab_tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "userId" INTEGER,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "analytics_events_event_idx" ON "analytics_events"("event");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ab_tests_name_key" ON "ab_tests"("name");

-- CreateIndex
CREATE INDEX "ab_tests_name_isActive_idx" ON "ab_tests"("name", "isActive");

-- CreateIndex
CREATE INDEX "ab_test_assignments_testId_variant_idx" ON "ab_test_assignments"("testId", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_assignments_testId_sessionId_key" ON "ab_test_assignments"("testId", "sessionId");

-- CreateIndex
CREATE INDEX "ab_test_conversions_testId_variant_idx" ON "ab_test_conversions"("testId", "variant");

-- CreateIndex
CREATE INDEX "ab_test_conversions_conversionType_idx" ON "ab_test_conversions"("conversionType");

-- CreateIndex
CREATE INDEX "search_queries_query_idx" ON "search_queries"("query");

-- CreateIndex
CREATE INDEX "search_queries_userId_idx" ON "search_queries"("userId");

-- CreateIndex
CREATE INDEX "search_queries_timestamp_idx" ON "search_queries"("timestamp");
