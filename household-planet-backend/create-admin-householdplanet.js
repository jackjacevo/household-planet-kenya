const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@2025', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@householdplanetkenya.co.ke' },
      update: {
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify(['ADMIN_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS', 'VIEW_ANALYTICS']),
        isActive: true,
        emailVerified: true
      },
      create: {
        email: 'admin@householdplanetkenya.co.ke',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify(['ADMIN_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS', 'VIEW_ANALYTICS']),
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Admin created:', user.email, user.role);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();