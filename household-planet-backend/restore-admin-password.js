const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restoreAdminPassword() {
  try {
    console.log('🔄 Restoring original admin password...');
    
    const hashedPassword = await bcrypt.hash('Admin@2025', 12);
    
    const updatedUser = await prisma.user.update({
      where: { email: 'householdplanet819@gmail.com' },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true
      }
    });
    
    console.log('✅ Password restored successfully');
    console.log(`Email: ${updatedUser.email}`);
    console.log('Password: Admin@2025');
    console.log(`Role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdminPassword();