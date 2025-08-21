const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  console.log('🔄 Resetting admin user...');
  
  const adminEmail = 'admin@householdplanet.co.ke';
  const adminPassword = 'HouseholdAdmin2024!';
  
  try {
    // First, clear any existing sessions for the admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('🗑️ Clearing existing admin sessions...');
      await prisma.userSession.deleteMany({
        where: { userId: existingAdmin.id }
      });
      
      console.log('🔄 Updating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          password: hashedPassword,
          loginAttempts: 0,
          lockedUntil: null,
          isActive: true,
          emailVerified: true,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user reset successfully!');
    } else {
      console.log('🆕 Creating new admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'ADMIN',
          emailVerified: true,
          phoneVerified: false,
          isActive: true,
          loginAttempts: 0
        }
      });
      
      console.log('✅ New admin user created successfully!');
      console.log('🆔 User ID:', admin.id);
    }
    
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\\n⚠️  You can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error resetting admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();