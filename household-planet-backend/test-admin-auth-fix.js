const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAdminAuth() {
  try {
    console.log('🔍 Testing admin authentication...\n');

    // 1. Check admin user exists and is active
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@householdplanet.co.ke' },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        isActive: true, 
        permissions: true,
        password: true,
        loginAttempts: true,
        lockedUntil: true
      }
    });

    if (!admin) {
      console.log('❌ Admin user not found. Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('Admin@2025', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@householdplanet.co.ke',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true,
          permissions: JSON.stringify(['*'])
        }
      });
      
      console.log('✅ Admin user created:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      });
      
      return;
    }

    console.log('✅ Admin user found:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      loginAttempts: admin.loginAttempts,
      lockedUntil: admin.lockedUntil
    });

    // 2. Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      console.log('🔓 Unlocking admin account...');
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null
        }
      });
      console.log('✅ Admin account unlocked');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare('Admin@2025', admin.password);
    console.log('🔑 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('🔄 Updating admin password...');
      const hashedPassword = await bcrypt.hash('Admin@2025', 12);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Admin password updated');
    }

    // 4. Generate test JWT token
    const jwtSecret = process.env.JWT_SECRET || 'household-planet-kenya-super-secret-jwt-key-2024';
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      emailVerified: true,
      phoneVerified: false,
      permissions: admin.permissions ? JSON.parse(admin.permissions) : ['*']
    };

    const testToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
    console.log('🎫 Test JWT token generated (first 50 chars):', testToken.substring(0, 50) + '...');

    // 5. Create a test session
    await prisma.userSession.deleteMany({
      where: { userId: admin.id }
    });

    const session = await prisma.userSession.create({
      data: {
        userId: admin.id,
        token: testToken,
        refreshToken: jwt.sign({ sub: admin.id, type: 'refresh' }, jwtSecret, { expiresIn: '7d' }),
        deviceInfo: JSON.stringify({ platform: 'Test', browser: 'Test' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true
      }
    });

    console.log('✅ Test session created:', session.id);

    // 6. Test API call
    console.log('\n🧪 Testing API call...');
    console.log('Use this token in your requests:');
    console.log('Authorization: Bearer ' + testToken);
    console.log('\nTest with curl:');
    console.log(`curl -H "Authorization: Bearer ${testToken}" https://api.householdplanetkenya.co.ke/api/admin/dashboard`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAuth();