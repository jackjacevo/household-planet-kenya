const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperuser() {
  try {
    const email = 'householdplanet819@gmail.com';
    const password = 'Admin@2025';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create or update user as SUPER_ADMIN
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify([
          'ADMIN_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS', 
          'VIEW_ANALYTICS', 'MANAGE_CATEGORIES', 'MANAGE_INVENTORY', 'MANAGE_PAYMENTS',
          'MANAGE_DELIVERY', 'MANAGE_STAFF', 'SYSTEM_SETTINGS', 'SUPER_ADMIN_ACCESS'
        ]),
        isActive: true,
        emailVerified: true,
        phoneVerified: true
      },
      create: {
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        name: 'Super Admin',
        phone: '+254700000001',
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify([
          'ADMIN_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS',
          'VIEW_ANALYTICS', 'MANAGE_CATEGORIES', 'MANAGE_INVENTORY', 'MANAGE_PAYMENTS', 
          'MANAGE_DELIVERY', 'MANAGE_STAFF', 'SYSTEM_SETTINGS', 'SUPER_ADMIN_ACCESS'
        ]),
        isActive: true,
        emailVerified: true,
        phoneVerified: true
      }
    });

    console.log('✅ SUPERUSER CREATED');
    console.log('Email:', email);
    console.log('Role:', user.role);
    console.log('🎉 Login now with full admin access!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperuser();