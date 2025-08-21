// Backup Verification System
const axios = require('axios');
const crypto = require('crypto');

class BackupVerifier {
  constructor() {
    this.backupTypes = {
      database: 'Database Backup',
      files: 'File System Backup',
      config: 'Configuration Backup',
      logs: 'Log Backup'
    };
    
    this.verificationSchedule = {
      database: 'daily',
      files: 'daily',
      config: 'weekly',
      logs: 'weekly'
    };
    
    this.retentionPolicies = {
      database: 30, // days
      files: 7,     // days
      config: 90,   // days
      logs: 14      // days
    };
  }

  async verifyDatabaseBackup() {
    console.log('🔍 Verifying database backup...');
    
    try {
      // Check if backup exists
      const backupInfo = await axios.get('https://api.householdplanet.co.ke/api/admin/backups/database/latest');
      
      if (!backupInfo.data.backup) {
        throw new Error('No database backup found');
      }
      
      const backup = backupInfo.data.backup;
      const backupAge = Date.now() - new Date(backup.timestamp).getTime();
      const maxAge = 25 * 60 * 60 * 1000; // 25 hours
      
      if (backupAge > maxAge) {
        throw new Error(`Database backup is ${Math.round(backupAge / (60 * 60 * 1000))} hours old`);
      }
      
      // Verify backup integrity
      const integrityCheck = await axios.post('https://api.householdplanet.co.ke/api/admin/backups/verify', {
        type: 'database',
        backupId: backup.id
      });
      
      if (!integrityCheck.data.valid) {
        throw new Error('Database backup integrity check failed');
      }
      
      // Test restore capability (on test database)
      const restoreTest = await axios.post('https://api.householdplanet.co.ke/api/admin/backups/test-restore', {
        type: 'database',
        backupId: backup.id,
        testMode: true
      });
      
      if (!restoreTest.data.success) {
        throw new Error('Database backup restore test failed');
      }
      
      console.log('✅ Database backup verification passed');
      return {
        type: 'database',
        status: 'success',
        backupSize: backup.size,
        backupAge: Math.round(backupAge / (60 * 60 * 1000)),
        integrityValid: true,
        restoreTestPassed: true
      };
      
    } catch (error) {
      console.log('❌ Database backup verification failed:', error.message);
      await this.sendBackupAlert('database', error.message);
      
      return {
        type: 'database',
        status: 'failed',
        error: error.message
      };
    }
  }

  async verifyFileBackup() {
    console.log('🔍 Verifying file system backup...');
    
    try {
      const backupInfo = await axios.get('https://api.householdplanet.co.ke/api/admin/backups/files/latest');
      
      if (!backupInfo.data.backup) {
        throw new Error('No file backup found');
      }
      
      const backup = backupInfo.data.backup;
      const backupAge = Date.now() - new Date(backup.timestamp).getTime();
      const maxAge = 25 * 60 * 60 * 1000; // 25 hours
      
      if (backupAge > maxAge) {
        throw new Error(`File backup is ${Math.round(backupAge / (60 * 60 * 1000))} hours old`);
      }
      
      // Verify backup completeness
      const fileCount = await axios.get('https://api.householdplanet.co.ke/api/admin/files/count');
      const expectedFiles = fileCount.data.count;
      
      if (backup.fileCount < expectedFiles * 0.95) { // Allow 5% variance
        throw new Error(`File backup incomplete: ${backup.fileCount}/${expectedFiles} files`);
      }
      
      // Verify checksum
      const checksumVerification = await axios.post('https://api.householdplanet.co.ke/api/admin/backups/verify-checksum', {
        type: 'files',
        backupId: backup.id
      });
      
      if (!checksumVerification.data.valid) {
        throw new Error('File backup checksum verification failed');
      }
      
      console.log('✅ File backup verification passed');
      return {
        type: 'files',
        status: 'success',
        backupSize: backup.size,
        fileCount: backup.fileCount,
        checksumValid: true
      };
      
    } catch (error) {
      console.log('❌ File backup verification failed:', error.message);
      await this.sendBackupAlert('files', error.message);
      
      return {
        type: 'files',
        status: 'failed',
        error: error.message
      };
    }
  }

  async verifyConfigBackup() {
    console.log('🔍 Verifying configuration backup...');
    
    try {
      const backupInfo = await axios.get('https://api.householdplanet.co.ke/api/admin/backups/config/latest');
      
      if (!backupInfo.data.backup) {
        throw new Error('No configuration backup found');
      }
      
      const backup = backupInfo.data.backup;
      const backupAge = Date.now() - new Date(backup.timestamp).getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (backupAge > maxAge) {
        throw new Error(`Configuration backup is ${Math.round(backupAge / (24 * 60 * 60 * 1000))} days old`);
      }
      
      // Verify essential config files are included
      const essentialConfigs = [
        'nginx.conf',
        'docker-compose.yml',
        '.env.production',
        'package.json'
      ];
      
      const configFiles = backup.files || [];
      const missingConfigs = essentialConfigs.filter(config => 
        !configFiles.some(file => file.includes(config))
      );
      
      if (missingConfigs.length > 0) {
        throw new Error(`Missing essential config files: ${missingConfigs.join(', ')}`);
      }
      
      console.log('✅ Configuration backup verification passed');
      return {
        type: 'config',
        status: 'success',
        fileCount: configFiles.length,
        essentialFilesPresent: true
      };
      
    } catch (error) {
      console.log('❌ Configuration backup verification failed:', error.message);
      await this.sendBackupAlert('config', error.message);
      
      return {
        type: 'config',
        status: 'failed',
        error: error.message
      };
    }
  }

  async checkBackupStorage() {
    console.log('🔍 Checking backup storage...');
    
    try {
      const storageInfo = await axios.get('https://api.householdplanet.co.ke/api/admin/backups/storage-info');
      const storage = storageInfo.data;
      
      const usagePercentage = (storage.used / storage.total) * 100;
      
      if (usagePercentage > 85) {
        await this.sendBackupAlert('storage', `Backup storage ${usagePercentage.toFixed(1)}% full`);
      }
      
      console.log(`📊 Backup storage: ${usagePercentage.toFixed(1)}% used`);
      
      return {
        total: storage.total,
        used: storage.used,
        available: storage.available,
        usagePercentage
      };
      
    } catch (error) {
      console.log('❌ Storage check failed:', error.message);
      return null;
    }
  }

  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...');
    
    for (const [type, retentionDays] of Object.entries(this.retentionPolicies)) {
      try {
        const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
        
        const cleanupResult = await axios.delete('https://api.householdplanet.co.ke/api/admin/backups/cleanup', {
          data: {
            type,
            cutoffDate: cutoffDate.toISOString()
          }
        });
        
        if (cleanupResult.data.deletedCount > 0) {
          console.log(`🗑️ Cleaned up ${cleanupResult.data.deletedCount} old ${type} backups`);
        }
        
      } catch (error) {
        console.log(`❌ Failed to cleanup ${type} backups:`, error.message);
      }
    }
  }

  async sendBackupAlert(backupType, message) {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 Backup Alert: ${this.backupTypes[backupType]}`,
        channel: '#backup-alerts',
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Backup Type', value: this.backupTypes[backupType], short: true },
            { title: 'Issue', value: message, short: false },
            { title: 'Time', value: new Date().toISOString(), short: true }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to send backup alert:', error);
    }
    
    // Send email for critical backup failures
    try {
      await axios.post('https://api.householdplanet.co.ke/api/notifications/email', {
        to: 'admin@householdplanet.co.ke',
        subject: `Backup Failure: ${this.backupTypes[backupType]}`,
        body: `
Backup verification failed:

Type: ${this.backupTypes[backupType]}
Issue: ${message}
Time: ${new Date().toISOString()}

Please investigate immediately.
        `
      });
    } catch (error) {
      console.error('Failed to send backup failure email:', error);
    }
  }

  async generateBackupReport(verificationResults, storageInfo) {
    const report = {
      date: new Date().toISOString().split('T')[0],
      verificationResults,
      storageInfo,
      summary: {
        totalBackups: verificationResults.length,
        successfulVerifications: verificationResults.filter(r => r.status === 'success').length,
        failedVerifications: verificationResults.filter(r => r.status === 'failed').length
      }
    };
    
    try {
      await axios.post('https://api.householdplanet.co.ke/api/admin/reports/backup', report);
      console.log('✅ Backup report generated');
    } catch (error) {
      console.error('Failed to generate backup report:', error);
    }
    
    return report;
  }

  async runDailyVerification() {
    console.log('🔄 Running daily backup verification...');
    
    const verificationResults = [];
    
    // Verify database backup
    const dbResult = await this.verifyDatabaseBackup();
    verificationResults.push(dbResult);
    
    // Verify file backup
    const fileResult = await this.verifyFileBackup();
    verificationResults.push(fileResult);
    
    // Check storage
    const storageInfo = await this.checkBackupStorage();
    
    // Cleanup old backups
    await this.cleanupOldBackups();
    
    // Generate report
    const report = await this.generateBackupReport(verificationResults, storageInfo);
    
    // Send summary
    const successCount = verificationResults.filter(r => r.status === 'success').length;
    const totalCount = verificationResults.length;
    
    if (successCount === totalCount) {
      console.log('✅ All backup verifications passed');
    } else {
      console.log(`⚠️ ${totalCount - successCount} backup verifications failed`);
    }
  }

  async runWeeklyVerification() {
    console.log('🔄 Running weekly backup verification...');
    
    // Verify configuration backup
    const configResult = await this.verifyConfigBackup();
    
    // Additional weekly checks can be added here
    
    return configResult;
  }

  startBackupVerification() {
    console.log('🔄 Starting backup verification system...');
    
    // Run daily verification at 3 AM
    const scheduleDailyVerification = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(3, 0, 0, 0);
      
      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeUntilVerification = scheduledTime.getTime() - now.getTime();
      setTimeout(() => {
        this.runDailyVerification();
        setInterval(() => this.runDailyVerification(), 86400000); // Daily
      }, timeUntilVerification);
    };
    
    scheduleDailyVerification();
    
    // Run weekly verification every Sunday at 4 AM
    const scheduleWeeklyVerification = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(4, 0, 0, 0);
      
      const timeUntilWeeklyVerification = nextSunday.getTime() - now.getTime();
      setTimeout(() => {
        this.runWeeklyVerification();
        setInterval(() => this.runWeeklyVerification(), 604800000); // Weekly
      }, timeUntilWeeklyVerification);
    };
    
    scheduleWeeklyVerification();
  }
}

// Start backup verification
const backupVerifier = new BackupVerifier();
backupVerifier.startBackupVerification();

module.exports = BackupVerifier;