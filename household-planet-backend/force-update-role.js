const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceUpdateRole() {
  try {
    const result = await prisma.user.updateMany({
      where: { email: 'householdplanet819@gmail.com' },
      data: { 
        role: 'SUPER_ADMIN',
        permissions: JSON.stringify(['ADMIN_DASHBOARD', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_USERS', 'VIEW_ANALYTICS']),
        isActive: true,
        emailVerified: true
      }
    });
    
    console.log('✅ Updated', result.count, 'user(s)');
    
    const user = await prisma.user.findUnique({
      where: { email: 'householdplanet819@gmail.com' }
    });
    
    console.log('👤 Current role:', user?.role);
    console.log('🔐 Permissions:', user?.permissions);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceUpdateRole();