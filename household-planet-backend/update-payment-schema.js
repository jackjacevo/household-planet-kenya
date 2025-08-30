const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePaymentSchema() {
  try {
    console.log('🔄 Updating payment transaction schema...');

    // Add new columns to payment_transactions table (SQLite syntax)
    try {
      await prisma.$executeRaw`ALTER TABLE payment_transactions ADD COLUMN paymentType TEXT DEFAULT 'STK_PUSH'`;
    } catch (e) { console.log('paymentType column may already exist'); }
    
    try {
      await prisma.$executeRaw`ALTER TABLE payment_transactions ADD COLUMN cashReceivedBy TEXT`;
    } catch (e) { console.log('cashReceivedBy column may already exist'); }
    
    try {
      await prisma.$executeRaw`ALTER TABLE payment_transactions ADD COLUMN paybillReference TEXT`;
    } catch (e) { console.log('paybillReference column may already exist'); }
    
    try {
      await prisma.$executeRaw`ALTER TABLE payment_transactions ADD COLUMN notes TEXT`;
    } catch (e) { console.log('notes column may already exist'); }

    // Update existing records to have proper payment types
    await prisma.$executeRaw`
      UPDATE payment_transactions 
      SET paymentType = CASE 
        WHEN provider = 'MPESA_C2B' THEN 'PAYBILL'
        WHEN provider = 'CASH' THEN 'CASH'
        ELSE 'STK_PUSH'
      END
      WHERE paymentType IS NULL OR paymentType = '';
    `;

    // Update provider names for consistency
    await prisma.$executeRaw`
      UPDATE payment_transactions 
      SET provider = 'MPESA'
      WHERE provider = 'MPESA_C2B';
    `;

    // Note: SQLite doesn't support ALTER COLUMN, orderId nullability handled in schema

    console.log('✅ Payment schema updated successfully!');
    console.log('📊 Payment types now supported:');
    console.log('   - STK_PUSH: M-Pesa STK Push payments');
    console.log('   - PAYBILL: M-Pesa Paybill payments (247247)');
    console.log('   - CASH: Cash payments recorded manually');

  } catch (error) {
    console.error('❌ Error updating payment schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePaymentSchema()
  .then(() => {
    console.log('🎉 Database schema update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema update failed:', error);
    process.exit(1);
  });