const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPromoToOrders() {
  try {
    // Add promo code fields to orders table
    await prisma.$executeRaw`
      ALTER TABLE "orders" ADD COLUMN "discountAmount" REAL DEFAULT 0;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "orders" ADD COLUMN "promoCode" TEXT;
    `;

    console.log('✅ Promo code fields added to orders table');

  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Promo code fields already exist in orders table');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addPromoToOrders();