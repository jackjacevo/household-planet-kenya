import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { CookieConsentService } from './cookie-consent.service';
import { DataExportService } from './data-export.service';
import { DataRetentionService } from './data-retention.service';
import { AgeVerificationService } from './age-verification.service';
import { GeographicRestrictionsService } from './geographic-restrictions.service';
import { TaxComplianceService } from './tax-compliance.service';
import { ConsumerRightsService } from './consumer-rights.service';
import { DisputeResolutionService } from './dispute-resolution.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    CookieConsentService,
    DataExportService,
    DataRetentionService,
    AgeVerificationService,
    GeographicRestrictionsService,
    TaxComplianceService,
    ConsumerRightsService,
    DisputeResolutionService,
  ],
  exports: [
    ComplianceService,
    AgeVerificationService,
    GeographicRestrictionsService,
    TaxComplianceService,
    ConsumerRightsService,
    DisputeResolutionService,
  ],
})
export class ComplianceModule {}