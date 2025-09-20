const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('Checking for admin users...\n');
    
    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} users:\n`);
    
    users.forEach(user => {
      const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
      console.log(`${isAdmin ? '👑' : '👤'} ${user.name || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // Check specifically for admin users
    const adminUsers = users.filter(user => 
      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    );

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      console.log('You need to create an admin user to access the admin dashboard.');
      console.log('\nTo create an admin user, run:');
      console.log('node create-admin-user.js');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s)`);
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role})`);
      });
    }

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();