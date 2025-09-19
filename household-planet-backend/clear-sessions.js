const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearSessions() {
  try {
    await prisma.userSession.updateMany({
      where: { userId: 2 },
      data: { isActive: false }
    });
    
    console.log('✅ All sessions cleared');
    console.log('🔄 Please login again to get fresh token with SUPER_ADMIN role');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();