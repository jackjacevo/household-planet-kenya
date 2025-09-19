const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserToAdmin() {
  console.log('🔧 Updating user to admin role...\n');

  try {
    const email = 'householdplanet819@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found. Please register first.');
      return;
    }

    console.log('👤 Found user:', user.email);

    // Update user role and permissions
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        permissions: JSON.stringify([
          'ADMIN_DASHBOARD',
          'MANAGE_PRODUCTS', 
          'MANAGE_ORDERS',
          'MANAGE_USERS',
          'VIEW_ANALYTICS',
          'MANAGE_CATEGORIES',
          'MANAGE_INVENTORY',
          'MANAGE_PAYMENTS',
          'MANAGE_DELIVERY',
          'MANAGE_STAFF',
          'SYSTEM_SETTINGS'
        ]),
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ User updated successfully!');
    console.log('📧 Email:', updatedUser.email);
    console.log('👑 Role:', updatedUser.role);
    console.log('🔐 Permissions:', JSON.parse(updatedUser.permissions || '[]'));

    console.log('\n🎉 Admin setup complete!');
    console.log('You can now login with:');
    console.log('Email: householdplanet819@gmail.com');
    console.log('Password: Admin@2025');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserToAdmin().catch(console.error);