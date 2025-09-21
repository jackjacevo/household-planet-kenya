const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking existing admin users...\n');
    
    // Check all users with admin roles
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' },
          { role: 'admin' },
          { role: 'super_admin' }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Active: ${user.isActive} - Verified: ${user.emailVerified}`);
    });
    
    // Check if we have a working admin
    const workingAdmin = adminUsers.find(user => 
      user.isActive && 
      user.emailVerified && 
      (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
    );
    
    if (!workingAdmin) {
      console.log('\n❌ No working admin found. Creating/updating admin user...');
      
      // Try to find existing admin by email
      let adminUser = await prisma.user.findUnique({
        where: { email: 'admin@householdplanet.co.ke' }
      });
      
      const hashedPassword = await bcrypt.hash('HouseholdPlanet2024!', 12);
      
      if (adminUser) {
        // Update existing user
        console.log('📝 Updating existing admin user...');
        adminUser = await prisma.user.update({
          where: { email: 'admin@householdplanet.co.ke' },
          data: {
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
            name: 'System Administrator'
          }
        });
        console.log('✅ Admin user updated successfully');
      } else {
        // Create new admin user
        console.log('👤 Creating new admin user...');
        adminUser = await prisma.user.create({
          data: {
            email: 'admin@householdplanet.co.ke',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
            phoneVerified: false
          }
        });
        console.log('✅ Admin user created successfully');
      }
      
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: HouseholdPlanet2024!`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log(`\n✅ Working admin found: ${workingAdmin.email}`);
      
      // Still update password to ensure it's correct
      console.log('🔄 Updating admin password to ensure it\'s correct...');
      const hashedPassword = await bcrypt.hash('HouseholdPlanet2024!', 12);
      
      await prisma.user.update({
        where: { email: workingAdmin.email },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Admin password updated');
      console.log(`   Email: ${workingAdmin.email}`);
      console.log(`   Password: HouseholdPlanet2024!`);
    }
    
    // Also check for any other common admin emails and update them
    const commonAdminEmails = [
      'admin@householdplanetkenya.co.ke',
      'administrator@householdplanet.co.ke',
      'admin@householdplanetkenya.com'
    ];
    
    console.log('\n🔍 Checking other common admin emails...');
    for (const email of commonAdminEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        console.log(`📝 Updating ${email}...`);
        const hashedPassword = await bcrypt.hash('HouseholdPlanet2024!', 12);
        
        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true
          }
        });
        console.log(`✅ Updated ${email}`);
      }
    }
    
    console.log('\n🎉 Admin setup complete!');
    console.log('\nAdmin Credentials:');
    console.log('Email: admin@householdplanet.co.ke');
    console.log('Password: HouseholdPlanet2024!');
    console.log('\nYou can now login to the admin panel.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();