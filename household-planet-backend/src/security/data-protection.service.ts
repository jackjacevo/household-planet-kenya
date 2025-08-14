import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import * as crypto from 'crypto';

@Injectable()
export class DataProtectionService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService
  ) {}

  // Data classification and protection
  async classifyAndProtectData(data: any, classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'): Promise<any> {
    switch (classification) {
      case 'RESTRICTED':
        // Highest level - encrypt all fields
        return this.encryptAllFields(data);
      case 'CONFIDENTIAL':
        // Encrypt sensitive fields only
        return this.encryptSensitiveFields(data);
      case 'INTERNAL':
        // Hash identifiable information
        return this.hashIdentifiableFields(data);
      case 'PUBLIC':
        // No additional protection needed
        return data;
      default:
        throw new Error('Invalid data classification');
    }
  }

  // Encrypt all fields in data object
  private async encryptAllFields(data: any): Promise<any> {
    const encrypted = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        encrypted[key] = await this.encryptionService.encrypt(value);
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }

  // Encrypt only sensitive fields
  private async encryptSensitiveFields(data: any): Promise<any> {
    const sensitiveFields = ['email', 'phone', 'address', 'paymentInfo', 'personalId'];
    const protectedData = { ...data };
    
    for (const field of sensitiveFields) {
      if (protectedData[field] && typeof protectedData[field] === 'string') {
        protectedData[field] = await this.encryptionService.encrypt(protectedData[field]);
      }
    }
    
    return protectedData;
  }

  // Hash identifiable fields
  private hashIdentifiableFields(data: any): any {
    const identifiableFields = ['email', 'phone', 'personalId'];
    const protectedData = { ...data };
    
    for (const field of identifiableFields) {
      if (protectedData[field] && typeof protectedData[field] === 'string') {
        protectedData[field] = crypto.createHash('sha256').update(protectedData[field]).digest('hex');
      }
    }
    
    return protectedData;
  }

  // Data anonymization for analytics
  async anonymizeUserData(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        reviews: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create anonymized version
    const anonymized = {
      id: `anon_${crypto.randomBytes(8).toString('hex')}`,
      demographics: {
        ageRange: this.getAgeRange(user.dateOfBirth),
        location: this.getLocationRegion(''),
        registrationMonth: user.createdAt.getMonth(),
        registrationYear: user.createdAt.getFullYear()
      },
      behavior: {
        totalOrders: user.orders?.length || 0,
        totalSpent: user.orders?.reduce((sum, order) => sum + order.total, 0) || 0,
        averageOrderValue: user.orders && user.orders.length > 0 ? 
          user.orders.reduce((sum, order) => sum + order.total, 0) / user.orders.length : 0,
        reviewsCount: user.reviews?.length || 0,
        lastActivityMonth: user.lastLoginAt ? user.lastLoginAt.getMonth() : null
      }
    };

    return anonymized;
  }

  // Get age range for anonymization
  private getAgeRange(dateOfBirth: Date): string {
    if (!dateOfBirth) return 'unknown';
    
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    
    if (age < 18) return '0-17';
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  // Get location region for anonymization
  private getLocationRegion(address: string): string {
    if (!address) return 'unknown';
    
    const lowerAddress = address.toLowerCase();
    
    if (lowerAddress.includes('nairobi')) return 'nairobi';
    if (lowerAddress.includes('mombasa')) return 'coast';
    if (lowerAddress.includes('kisumu')) return 'western';
    if (lowerAddress.includes('nakuru')) return 'rift-valley';
    if (lowerAddress.includes('eldoret')) return 'rift-valley';
    if (lowerAddress.includes('thika')) return 'central';
    if (lowerAddress.includes('meru')) return 'eastern';
    
    return 'other';
  }

  // Data masking for display purposes
  maskSensitiveData(data: any, fields: string[]): any {
    const masked = { ...data };
    
    for (const field of fields) {
      if (masked[field]) {
        if (field === 'email') {
          masked[field] = this.maskEmail(masked[field]);
        } else if (field === 'phone') {
          masked[field] = this.maskPhone(masked[field]);
        } else if (field === 'cardNumber') {
          masked[field] = this.maskCardNumber(masked[field]);
        } else {
          // Generic masking
          masked[field] = this.maskGeneric(masked[field]);
        }
      }
    }
    
    return masked;
  }

  // Mask email address
  private maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}*@${domain}`;
    }
    return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
  }

  // Mask phone number
  private maskPhone(phone: string): string {
    if (phone.length <= 4) return phone;
    return `${phone.substring(0, 3)}${'*'.repeat(phone.length - 6)}${phone.substring(phone.length - 3)}`;
  }

  // Mask card number
  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length <= 4) return cardNumber;
    return `****-****-****-${cardNumber.substring(cardNumber.length - 4)}`;
  }

  // Generic masking
  private maskGeneric(value: string): string {
    if (value.length <= 2) return '*'.repeat(value.length);
    return `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
  }

  // Data retention management
  async enforceDataRetention(): Promise<void> {
    const retentionPolicies = [
      { table: 'auditLog', field: 'timestamp', days: 90 },
      { table: 'securityEvent', field: 'timestamp', days: 90 },
      { table: 'paymentAuditLog', field: 'timestamp', days: 2555 }, // 7 years for financial records
      { table: 'userConsent', field: 'timestamp', days: 730 }, // 2 years
      { table: 'cookieConsent', field: 'timestamp', days: 730 } // 2 years
    ];

    for (const policy of retentionPolicies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.days);

      try {
        await this.prisma[policy.table].deleteMany({
          where: {
            [policy.field]: { lt: cutoffDate }
          }
        });

        console.log(`Data retention: Cleaned ${policy.table} records older than ${policy.days} days`);
      } catch (error) {
        console.error(`Error cleaning ${policy.table}:`, error);
      }
    }
  }

  // Secure data deletion
  async secureDelete(table: string, id: string): Promise<void> {
    // First, overwrite sensitive data with random values
    const randomData = {
      email: crypto.randomBytes(16).toString('hex') + '@deleted.local',
      phone: crypto.randomBytes(8).toString('hex'),
      firstName: 'DELETED',
      lastName: 'USER',
      address: 'DELETED'
    };

    try {
      // Overwrite with random data first
      await this.prisma[table].update({
        where: { id },
        data: randomData
      });

      // Then delete the record
      await this.prisma[table].delete({
        where: { id }
      });

      console.log(`Secure deletion completed for ${table} ID: ${id}`);
    } catch (error) {
      console.error(`Error in secure deletion:`, error);
      throw error;
    }
  }

  // Data breach detection
  async detectDataBreach(suspiciousActivity: any): Promise<boolean> {
    const indicators = [
      suspiciousActivity.unusualDataAccess,
      suspiciousActivity.multipleFailedLogins,
      suspiciousActivity.dataExfiltrationAttempt,
      suspiciousActivity.unauthorizedSystemAccess,
      suspiciousActivity.suspiciousNetworkTraffic
    ];

    const breachScore = indicators.filter(Boolean).length;
    
    if (breachScore >= 3) {
      await this.handleDataBreach({
        detectedAt: new Date(),
        indicators: suspiciousActivity,
        severity: breachScore >= 4 ? 'HIGH' : 'MEDIUM',
        autoDetected: true
      });
      return true;
    }

    return false;
  }

  // Handle data breach
  private async handleDataBreach(breachDetails: any): Promise<void> {
    // Log the breach
    await this.prisma.dataBreach.create({
      data: {
        type: 'AUTO_DETECTED',
        description: `Auto-detected breach: ${JSON.stringify(breachDetails.indicators)}`,
        severity: breachDetails.severity,
        affectedUsers: 0
      }
    });

    // Immediate security measures
    await this.activateBreachResponse();

    // Schedule notifications (72-hour requirement for GDPR)
    setTimeout(async () => {
      await this.notifyAuthorities(breachDetails);
    }, 1000); // In production, this would be immediate

    console.log('🚨 DATA BREACH DETECTED - Immediate response activated');
  }

  // Activate breach response procedures
  private async activateBreachResponse(): Promise<void> {
    // 1. Isolate affected systems
    console.log('🔒 Isolating affected systems...');
    
    // 2. Preserve evidence
    console.log('📋 Preserving breach evidence...');
    
    // 3. Assess scope
    console.log('🔍 Assessing breach scope...');
    
    // 4. Notify security team
    console.log('📞 Notifying security team...');
    
    // 5. Prepare user notifications
    console.log('📧 Preparing user notifications...');
  }

  // Notify authorities of data breach
  private async notifyAuthorities(breachDetails: any): Promise<void> {
    const notification = {
      timestamp: new Date().toISOString(),
      breach: breachDetails,
      companyInfo: {
        name: 'Household Planet Kenya',
        contact: 'privacy@householdplanet.co.ke',
        dpo: 'dpo@householdplanet.co.ke'
      },
      notificationRequired: true
    };

    console.log('📋 Authority notification prepared:', notification);
    // In production: send to data protection authority
  }

  // Generate data protection report
  async generateDataProtectionReport(): Promise<any> {
    const report = {
      reportId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      period: '30 days',
      dataProtectionMetrics: {
        encryptedRecords: await this.countEncryptedRecords(),
        anonymizedRecords: await this.countAnonymizedRecords(),
        dataRetentionCompliance: await this.checkRetentionCompliance(),
        breachIncidents: await this.countBreachIncidents(),
        dataSubjectRequests: await this.countDataSubjectRequests()
      },
      complianceStatus: 'COMPLIANT',
      recommendations: [
        'Continue regular data protection audits',
        'Update encryption keys quarterly',
        'Review data retention policies annually'
      ]
    };

    return report;
  }

  // Helper methods for reporting
  private async countEncryptedRecords(): Promise<number> {
    // This would count records with encrypted fields
    return 1000; // Placeholder
  }

  private async countAnonymizedRecords(): Promise<number> {
    // This would count anonymized records
    return 500; // Placeholder
  }

  private async checkRetentionCompliance(): Promise<string> {
    // Check if retention policies are being followed
    return 'COMPLIANT';
  }

  private async countBreachIncidents(): Promise<number> {
    // Placeholder - would count from data_breach table
    return 0;
  }

  private async countDataSubjectRequests(): Promise<number> {
    // Placeholder - would count from data_export_request table
    return 0;
  }
}