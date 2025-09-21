const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminPermissions() {
  try {
    console.log('🔧 Fixing admin permissions...\n');
    
    const updatedUser = await prisma.user.update({
      where: { email: 'householdplanet819@gmail.com' },
      data: {
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        permissions: JSON.stringify([
          'manage_products',
          'manage_orders', 
          'manage_customers',
          'view_analytics',
          'manage_content',
          'manage_payments',
          'manage_staff',
          'view_dashboard'
        ])
      }
    });
    
    console.log('✅ Admin permissions updated');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Permissions: ${JSON.stringify(updatedUser.permissions)}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPermissions();