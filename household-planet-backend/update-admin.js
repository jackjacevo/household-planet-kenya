const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminUser() {
  try {
    console.log('Updating admin user...');
    
    const email = 'admin@householdplanetkenya.co.ke';
    const password = 'Admin@2025';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update admin user
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true
      },
      create: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        phone: '+254790227760'
      }
    });
    
    console.log('✅ Admin user updated successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error updating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminUser();