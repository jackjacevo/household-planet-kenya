const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSchema() {
  try {
    console.log('Updating database schema for Phase 6 completion...');
    
    // Add permissions column to users table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[]';
    `;
    
    // Add isActive column to users table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE users ADD COLUMN isActive BOOLEAN DEFAULT true;
    `;
    
    // Add lastLogin column to users table if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE users ADD COLUMN lastLogin DATETIME;
    `;
    
    // Create admin_activities table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS admin_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        entityType TEXT,
        entityId INTEGER,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    
    // Create indexes for admin_activities
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_admin_activities_userId ON admin_activities(userId);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_admin_activities_action ON admin_activities(action);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_admin_activities_entityType ON admin_activities(entityType);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_admin_activities_createdAt ON admin_activities(createdAt);
    `;
    
    console.log('Database schema updated successfully!');
    
  } catch (error) {
    if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
      console.log('Schema already up to date.');
    } else {
      console.error('Error updating schema:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateSchema();