const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  console.log('🔍 Checking admin user...');
  
  const adminEmail = 'admin@householdplanet.co.ke';
  
  try {
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('📧 Email:', admin.email);
    console.log('🆔 ID:', admin.id);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('✉️ Email Verified:', admin.emailVerified);
    console.log('📱 Phone Verified:', admin.phoneVerified);
    console.log('🔓 Is Active:', admin.isActive);
    console.log('🔒 Login Attempts:', admin.loginAttempts);
    console.log('⏰ Locked Until:', admin.lockedUntil);
    console.log('🕐 Last Login:', admin.lastLogin);
    console.log('📅 Created At:', admin.createdAt);
    
    // Test password
    const testPassword = 'HouseholdAdmin2024!';
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
    console.log('🔐 Password Valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('⚠️ Password does not match! Updating password...');
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          loginAttempts: 0,
          lockedUntil: null,
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Password updated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();