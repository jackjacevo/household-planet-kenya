const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    console.log('Updating user role to ADMIN...');
    
    const user = await prisma.user.update({
      where: { email: 'admin@householdplanet.co.ke' },
      data: { role: 'ADMIN' }
    });
    
    console.log('✅ User role updated to ADMIN');
    console.log('User:', user.email, 'Role:', user.role);
    
  } catch (error) {
    console.error('❌ Failed to update user role:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole();