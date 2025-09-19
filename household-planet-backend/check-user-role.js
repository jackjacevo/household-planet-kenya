const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'householdplanet819@gmail.com' }
    });
    
    console.log('Database user:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      permissions: user?.permissions,
      isActive: user?.isActive,
      emailVerified: user?.emailVerified
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();