const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@householdplanet.co.ke' }
    });

    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('Active:', adminUser.isActive);
      console.log('Email Verified:', adminUser.emailVerified);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('Admin@2025', adminUser.password);
      console.log('Password Valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('🔄 Updating admin password...');
        const hashedPassword = await bcrypt.hash('Admin@2025', 12);
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: hashedPassword }
        });
        console.log('✅ Admin password updated');
      }
    } else {
      console.log('❌ Admin user not found. Creating...');
      const hashedPassword = await bcrypt.hash('Admin@2025', 12);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@householdplanet.co.ke',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'ADMIN',
          emailVerified: true,
          isActive: true,
        }
      });
      
      console.log('✅ Admin user created');
      console.log('ID:', admin.id);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();