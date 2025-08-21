const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function clearDemoData() {
  console.log('🗑️ Clearing demo products...');
  
  // Delete all products and variants
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  
  // Keep admin user but remove demo customers
  await prisma.user.deleteMany({
    where: {
      role: 'CUSTOMER'
    }
  });
  
  // Reset admin password to default (create if doesn't exist)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@householdplanet.co.ke' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@householdplanet.co.ke',
      name: 'Admin User',
      role: 'ADMIN',
      password: hashedPassword,
      emailVerified: true,
    }
  });
  
  console.log('✅ Demo data cleared. Admin account preserved.');
  console.log('📧 Admin: admin@householdplanet.co.ke');
  console.log('🔑 Password: admin123');
}

clearDemoData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());