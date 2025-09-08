const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPromoTables() {
  try {
    // Create promo_codes table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "promo_codes" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "code" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "discountType" TEXT NOT NULL,
        "discountValue" REAL NOT NULL,
        "minOrderAmount" REAL DEFAULT 0,
        "maxDiscount" REAL,
        "usageLimit" INTEGER,
        "usageCount" INTEGER NOT NULL DEFAULT 0,
        "userUsageLimit" INTEGER DEFAULT 1,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "validUntil" DATETIME,
        "applicableProducts" TEXT,
        "applicableCategories" TEXT,
        "createdBy" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create promo_code_usages table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "promo_code_usages" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "promoCodeId" INTEGER NOT NULL,
        "userId" INTEGER,
        "orderId" INTEGER,
        "sessionId" TEXT,
        "discountAmount" REAL NOT NULL,
        "orderAmount" REAL NOT NULL,
        "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "users" ("id"),
        FOREIGN KEY ("orderId") REFERENCES "orders" ("id")
      )
    `;

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "promo_codes_code_idx" ON "promo_codes"("code")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "promo_codes_isActive_idx" ON "promo_codes"("isActive")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "promo_code_usages_promoCodeId_idx" ON "promo_code_usages"("promoCodeId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "promo_code_usages_userId_idx" ON "promo_code_usages"("userId")`;

    console.log('✅ Promo code tables created successfully');

    // Insert some sample promo codes
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO "promo_codes" (
        "code", "name", "description", "discountType", "discountValue", 
        "minOrderAmount", "isActive", "validFrom", "createdBy"
      ) VALUES 
      ('SAVE10', '10% Off', 'Get 10% off your order', 'PERCENTAGE', 10, 1000, true, datetime('now'), 'System'),
      ('WELCOME20', '20% Welcome Discount', 'Welcome new customers with 20% off', 'PERCENTAGE', 20, 2000, true, datetime('now'), 'System'),
      ('HOUSEHOLD15', '15% Household Items', 'Special discount on household items', 'PERCENTAGE', 15, 1500, true, datetime('now'), 'System'),
      ('FIXED100', '100 KSh Off', 'Get 100 KSh off your order', 'FIXED', 100, 500, true, datetime('now'), 'System')
    `;

    console.log('✅ Sample promo codes inserted');

  } catch (error) {
    console.error('❌ Error creating promo tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPromoTables();