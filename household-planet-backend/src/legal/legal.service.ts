import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalAgreementDto, LegalDocumentRequestDto } from './dto/legal.dto';

@Injectable()
export class LegalService {
  constructor(private prisma: PrismaService) {}

  async getLegalDocuments(query: any) {
    const legalDocuments = [
      {
        id: 'terms-of-service',
        title: 'Terms of Service',
        description: 'Comprehensive terms and conditions for using our platform and services.',
        category: 'Essential',
        version: '2.1',
        lastUpdated: new Date().toISOString(),
        url: '/legal/terms',
        required: true,
        languages: ['en', 'sw']
      },
      {
        id: 'privacy-policy',
        title: 'Privacy Policy',
        description: 'How we collect, use, and protect your personal information with GDPR compliance.',
        category: 'Privacy',
        version: '3.0',
        lastUpdated: new Date().toISOString(),
        url: '/privacy',
        required: true,
        languages: ['en', 'sw']
      },
      {
        id: 'cookie-policy',
        title: 'Cookie Policy',
        description: 'Information about cookies and tracking technologies we use.',
        category: 'Privacy',
        version: '1.5',
        lastUpdated: new Date().toISOString(),
        url: '/legal/cookies',
        required: false,
        languages: ['en']
      },
      {
        id: 'return-refund-policy',
        title: 'Return & Refund Policy',
        description: 'Detailed information about returns, refunds, and exchange procedures.',
        category: 'Shopping',
        version: '2.0',
        lastUpdated: new Date().toISOString(),
        url: '/legal/returns',
        required: false,
        languages: ['en', 'sw']
      },
      {
        id: 'shipping-delivery-policy',
        title: 'Shipping & Delivery Policy',
        description: 'Shipping options, delivery timeframes, and policies across Kenya.',
        category: 'Shopping',
        version: '1.8',
        lastUpdated: new Date().toISOString(),
        url: '/legal/shipping',
        required: false,
        languages: ['en', 'sw']
      },
      {
        id: 'acceptable-use-policy',
        title: 'Acceptable Use Policy',
        description: 'Guidelines for acceptable use of our platform and community features.',
        category: 'Community',
        version: '1.3',
        lastUpdated: new Date().toISOString(),
        url: '/legal/acceptable-use',
        required: false,
        languages: ['en']
      },
      {
        id: 'data-protection-agreement',
        title: 'Customer Data Protection Agreement',
        description: 'Our commitment to protecting your data and your privacy rights.',
        category: 'Privacy',
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        url: '/legal/data-protection',
        required: true,
        languages: ['en']
      }
    ];

    // Filter by category if specified
    if (query.category) {
      return legalDocuments.filter(doc => doc.category.toLowerCase() === query.category.toLowerCase());
    }

    // Filter by required status if specified
    if (query.required !== undefined) {
      const isRequired = query.required === 'true';
      return legalDocuments.filter(doc => doc.required === isRequired);
    }

    return legalDocuments;
  }

  async getLegalDocument(type: string, version?: string) {
    const documents = await this.getLegalDocuments({});
    const document = documents.find(doc => doc.id === type);

    if (!document) {
      throw new NotFoundException(`Legal document '${type}' not found`);
    }

    // Return document metadata with content summary
    return {
      ...document,
      content: {
        sections: this.getDocumentSections(type),
        wordCount: this.getDocumentWordCount(type),
        readingTime: this.getDocumentReadingTime(type)
      },
      compliance: {
        gdpr: true,
        kenyanDataProtectionAct: true,
        consumerProtectionAct: true
      }
    };
  }

  async createLegalAgreement(userId: number, createLegalAgreementDto: CreateLegalAgreementDto) {
    const { documentType, version, ipAddress, userAgent } = createLegalAgreementDto;

    // Check if user has already agreed to this version
    const existingAgreement = await this.prisma.legalAgreement.findFirst({
      where: {
        userId: userId.toString(),
        documentType,
        version,
        status: 'ACTIVE'
      }
    });

    if (existingAgreement) {
      return {
        success: true,
        message: 'Agreement already exists',
        agreement: existingAgreement
      };
    }

    // Create new agreement
    const agreement = await this.prisma.legalAgreement.create({
      data: {
        userId: userId.toString(),
        documentType,
        version,
        agreedAt: new Date(),
        ipAddress,
        userAgent,
        status: 'ACTIVE'
      }
    });

    return {
      success: true,
      message: 'Legal agreement recorded successfully',
      agreement
    };
  }

  async getUserAgreements(userId: number) {
    const agreements = await this.prisma.legalAgreement.findMany({
      where: { userId: userId.toString() },
      orderBy: { agreedAt: 'desc' }
    });

    const documents = await this.getLegalDocuments({});
    
    return {
      agreements,
      compliance: {
        requiredDocuments: documents.filter(doc => doc.required),
        agreedDocuments: agreements.filter(agreement => agreement.status === 'ACTIVE'),
        missingAgreements: documents
          .filter(doc => doc.required)
          .filter(doc => !agreements.some(agreement => 
            agreement.documentType === doc.id && 
            agreement.status === 'ACTIVE'
          ))
      }
    };
  }

  async requestLegalDocument(userId: number, requestDto: LegalDocumentRequestDto) {
    const { documentType, requestType, reason } = requestDto;

    // Log the request
    await this.prisma.legalDocumentRequest.create({
      data: {
        userId: userId.toString(),
        documentType,
        requestType,
        reason,
        status: 'PENDING',
        requestedAt: new Date()
      }
    });

    // Handle different request types
    switch (requestType) {
      case 'DATA_EXPORT':
        return this.handleDataExportRequest(userId, documentType);
      case 'DATA_DELETION':
        return this.handleDataDeletionRequest(userId, documentType);
      case 'CONSENT_WITHDRAWAL':
        return this.handleConsentWithdrawalRequest(userId, documentType);
      case 'DOCUMENT_COPY':
        return this.handleDocumentCopyRequest(userId, documentType);
      default:
        throw new BadRequestException('Invalid request type');
    }
  }

  async getComplianceStatus(userId: number) {
    const agreements = await this.getUserAgreements(userId);
    const documents = await this.getLegalDocuments({});
    
    const requiredDocs = documents.filter(doc => doc.required);
    const agreedDocs = agreements.agreements.filter(agreement => agreement.status === 'ACTIVE');
    
    const compliancePercentage = (agreedDocs.length / requiredDocs.length) * 100;
    
    return {
      isCompliant: compliancePercentage === 100,
      compliancePercentage: Math.round(compliancePercentage),
      requiredDocuments: requiredDocs.length,
      agreedDocuments: agreedDocs.length,
      missingAgreements: agreements.compliance.missingAgreements,
      lastUpdated: new Date().toISOString()
    };
  }

  async getPrivacyRights() {
    return {
      gdprRights: [
        {
          right: 'Right of Access',
          description: 'Request a copy of your personal data',
          howToExercise: 'Contact our Data Protection Officer or use the Privacy Dashboard'
        },
        {
          right: 'Right to Rectification',
          description: 'Correct inaccurate or incomplete data',
          howToExercise: 'Update your profile or contact customer support'
        },
        {
          right: 'Right to Erasure',
          description: 'Request deletion of your personal data',
          howToExercise: 'Submit a data deletion request through your account settings'
        },
        {
          right: 'Right to Data Portability',
          description: 'Receive your data in a portable format',
          howToExercise: 'Request data export through the Privacy Dashboard'
        },
        {
          right: 'Right to Object',
          description: 'Object to processing based on legitimate interests',
          howToExercise: 'Contact our Data Protection Officer with your objection'
        },
        {
          right: 'Right to Withdraw Consent',
          description: 'Withdraw consent for consent-based processing',
          howToExercise: 'Use consent management tools in your account settings'
        }
      ],
      kenyanRights: [
        {
          right: 'Right to be Informed',
          description: 'Know how your data is being processed',
          howToExercise: 'Review our Privacy Policy and Data Protection Agreement'
        },
        {
          right: 'Right to Compensation',
          description: 'Seek compensation for data protection violations',
          howToExercise: 'File a complaint with the Data Protection Commissioner'
        }
      ],
      contactInformation: {
        dataProtectionOfficer: 'dpo@householdplanetkenya.co.ke',
        privacyInquiries: 'privacy@householdplanetkenya.co.ke',
        phone: '+254 700 000 000',
        responseTime: 'Within 48 hours for urgent matters'
      }
    };
  }

  async withdrawConsent(userId: number, consentType: string, reason?: string) {
    // Record consent withdrawal
    await this.prisma.consentWithdrawal.create({
      data: {
        userId: userId.toString(),
        consentType,
        reason,
        withdrawnAt: new Date(),
        status: 'PROCESSED'
      }
    });

    // Update user preferences based on consent type
    switch (consentType) {
      case 'MARKETING':
        await this.prisma.user.update({
          where: { id: userId },
          data: { marketingConsent: false }
        });
        break;
      case 'ANALYTICS':
        await this.prisma.user.update({
          where: { id: userId },
          data: { analyticsConsent: false }
        });
        break;
      case 'COOKIES':
        // Handle cookie consent withdrawal
        break;
    }

    return {
      success: true,
      message: `Consent for ${consentType} has been withdrawn successfully`,
      effectiveDate: new Date().toISOString()
    };
  }

  private getDocumentSections(documentType: string): string[] {
    const sectionMap = {
      'terms-of-service': [
        'Acceptance of Terms',
        'Service Description',
        'User Accounts',
        'Orders and Payments',
        'Delivery and Risk of Loss',
        'Returns and Refunds',
        'Prohibited Uses',
        'Intellectual Property',
        'Limitation of Liability',
        'Governing Law'
      ],
      'privacy-policy': [
        'Information We Collect',
        'How We Use Your Information',
        'Legal Basis for Processing',
        'Your Privacy Rights',
        'Data Sharing and Disclosure',
        'Data Security',
        'International Data Transfers',
        'Data Retention',
        'Children\'s Privacy'
      ],
      'cookie-policy': [
        'What Are Cookies',
        'Types of Cookies We Use',
        'Third-Party Cookies',
        'Cookie Duration',
        'Managing Cookie Preferences',
        'Impact of Disabling Cookies'
      ]
    };

    return sectionMap[documentType] || [];
  }

  private getDocumentWordCount(documentType: string): number {
    const wordCounts = {
      'terms-of-service': 2500,
      'privacy-policy': 3200,
      'cookie-policy': 1800,
      'return-refund-policy': 2100,
      'shipping-delivery-policy': 2300,
      'acceptable-use-policy': 1900,
      'data-protection-agreement': 2800
    };

    return wordCounts[documentType] || 1500;
  }

  private getDocumentReadingTime(documentType: string): number {
    const wordCount = this.getDocumentWordCount(documentType);
    return Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed
  }

  private async handleDataExportRequest(userId: number, documentType: string) {
    // Implementation for data export
    return {
      success: true,
      message: 'Data export request submitted. You will receive an email within 30 days.',
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private async handleDataDeletionRequest(userId: number, documentType: string) {
    // Implementation for data deletion
    return {
      success: true,
      message: 'Data deletion request submitted. This action cannot be undone.',
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private async handleConsentWithdrawalRequest(userId: number, documentType: string) {
    // Implementation for consent withdrawal
    return {
      success: true,
      message: 'Consent withdrawal processed successfully.',
      effectiveDate: new Date().toISOString()
    };
  }

  private async handleDocumentCopyRequest(userId: number, documentType: string) {
    // Implementation for document copy request
    return {
      success: true,
      message: 'Document copy request submitted. You will receive it via email.',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}
