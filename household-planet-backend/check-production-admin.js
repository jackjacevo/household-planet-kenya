const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductionAdmin() {
  try {
    console.log('🔍 Checking production admin user...\n');
    
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'householdplanet819@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        permissions: true,
        createdAt: true
      }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    console.log(`   Email Verified: ${adminUser.emailVerified}`);
    console.log(`   Permissions: ${JSON.stringify(adminUser.permissions)}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    
    // Check if user needs updates
    const needsUpdate = 
      adminUser.role !== 'SUPER_ADMIN' || 
      !adminUser.isActive || 
      !adminUser.emailVerified ||
      !adminUser.permissions ||
      adminUser.permissions.length === 0;
    
    if (needsUpdate) {
      console.log('\n🔄 Updating admin user...');
      
      const updatedUser = await prisma.user.update({
        where: { email: 'householdplanet819@gmail.com' },
        data: {
          role: 'SUPER_ADMIN',
          isActive: true,
          emailVerified: true,
          permissions: [
            'manage_products',
            'manage_orders', 
            'manage_customers',
            'view_analytics',
            'manage_content',
            'manage_payments',
            'manage_staff',
            'view_dashboard'
          ]
        }
      });
      
      console.log('✅ Admin user updated successfully');
      console.log(`   New Role: ${updatedUser.role}`);
      console.log(`   Permissions: ${JSON.stringify(updatedUser.permissions)}`);
    } else {
      console.log('\n✅ Admin user is properly configured');
    }
    
    // Check all admin/super_admin users
    console.log('\n📋 All admin users in database:');
    const allAdmins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true
      }
    });
    
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role}) - Active: ${admin.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionAdmin();