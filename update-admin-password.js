const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('🔍 Finding admin user...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'householdplanet819@gmail.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', admin.email);
    
    const hashedPassword = await bcrypt.hash('Admin@2025', 10);
    
    await prisma.user.update({
      where: { email: 'householdplanet819@gmail.com' },
      data: { 
        password: hashedPassword,
        isActive: true,
        isVerified: true
      }
    });
    
    console.log('✅ Password updated successfully');
    console.log('📧 Email: householdplanet819@gmail.com');
    console.log('🔑 Password: Admin@2025');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();