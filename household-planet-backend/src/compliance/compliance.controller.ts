import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComplianceService } from './compliance.service';
import { CookieConsentService } from './cookie-consent.service';
import { DataExportService } from './data-export.service';
import { DataRetentionService } from './data-retention.service';
import { AgeVerificationService } from './age-verification.service';
import { GeographicRestrictionsService } from './geographic-restrictions.service';
import { TaxComplianceService } from './tax-compliance.service';
import { ConsumerRightsService } from './consumer-rights.service';
import { DisputeResolutionService } from './dispute-resolution.service';

@Controller('compliance')
export class ComplianceController {
  constructor(
    private complianceService: ComplianceService,
    private cookieConsentService: CookieConsentService,
    private dataExportService: DataExportService,
    private dataRetentionService: DataRetentionService,
    private ageVerificationService: AgeVerificationService,
    private geographicRestrictionsService: GeographicRestrictionsService,
    private taxComplianceService: TaxComplianceService,
    private consumerRightsService: ConsumerRightsService,
    private disputeResolutionService: DisputeResolutionService,
  ) {}

  @Post('cookie-consent')
  async recordCookieConsent(@Body() body: any, @Req() req: any) {
    return this.cookieConsentService.recordCookieConsent(
      req.sessionID,
      body.consents,
      req.ip,
    );
  }

  @Get('cookie-consent/:sessionId')
  async getCookieConsent(@Param('sessionId') sessionId: string) {
    return this.cookieConsentService.getCookieConsent(sessionId);
  }

  @Get('cookie-policy')
  getCookiePolicy() {
    return this.cookieConsentService.getCookiePolicy();
  }

  @UseGuards(JwtAuthGuard)
  @Post('consent')
  async recordConsent(@Body() body: any, @Req() req: any) {
    return this.complianceService.recordConsent(
      req.user.id,
      body.consentType,
      body.granted,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('consents')
  async getUserConsents(@Req() req: any) {
    return this.complianceService.getUserConsents(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('privacy-settings')
  async updatePrivacySettings(@Body() settings: any, @Req() req: any) {
    return this.complianceService.updatePrivacySettings(req.user.id, settings);
  }

  @UseGuards(JwtAuthGuard)
  @Post('data-export')
  async requestDataExport(@Req() req: any) {
    return this.dataExportService.exportUserData(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-history')
  async getExportHistory(@Req() req: any) {
    return this.dataExportService.getExportHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async requestAccountDeletion(@Body() body: any, @Req() req: any) {
    return this.complianceService.requestDataDeletion(req.user.id, body.reason);
  }

  @Get('privacy-policy')
  getPrivacyPolicy() {
    return {
      lastUpdated: '2025-01-01',
      sections: {
        dataCollection: 'We collect personal information you provide when creating an account, making purchases, or contacting us.',
        dataUsage: 'Your data is used to process orders, provide customer service, and improve our services.',
        dataSharing: 'We do not sell your personal data. We may share data with service providers who help us operate our business.',
        dataRetention: 'We retain your data as long as your account is active or as needed to provide services.',
        yourRights: 'You have the right to access, update, or delete your personal data.',
        contact: 'Contact us at privacy@householdplanet.co.ke for privacy-related questions.',
      },
    };
  }

  @Get('retention-policy')
  getRetentionPolicy() {
    return this.dataRetentionService.getRetentionPolicy();
  }

  // Age Verification Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('age-verification')
  async verifyAge(@Body() body: any, @Req() req: any) {
    return this.ageVerificationService.verifyAge(
      req.user.id,
      new Date(body.dateOfBirth),
      body.documentType,
      body.documentNumber,
    );
  }

  @Get('product/:productId/age-restriction')
  async checkProductAgeRestriction(@Param('productId') productId: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.ageVerificationService.checkProductAgeRestriction(parseInt(productId), userId);
  }

  // Geographic Restrictions Endpoints
  @Get('product/:productId/geographic-availability')
  async checkGeographicRestriction(
    @Param('productId') productId: string,
    @Query('county') county: string,
    @Query('subcounty') subcounty?: string,
  ) {
    return this.geographicRestrictionsService.checkGeographicRestriction(
      parseInt(productId),
      county,
      subcounty,
    );
  }

  @Get('product/:productId/available-regions')
  async getAvailableRegions(@Param('productId') productId: string) {
    return this.geographicRestrictionsService.getAvailableRegions(parseInt(productId));
  }

  // Tax Compliance Endpoints
  @Get('vat-calculation/:productId')
  async calculateVAT(@Param('productId') productId: string, @Query('amount') amount: string) {
    return this.taxComplianceService.calculateVAT(productId, parseFloat(amount));
  }

  @Get('business-registration')
  getBusinessRegistrationInfo() {
    return this.taxComplianceService.getBusinessRegistrationInfo();
  }

  @Get('vat-report')
  async generateVATReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.taxComplianceService.generateVATReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Consumer Rights Endpoints
  @Get('consumer-rights')
  getConsumerRights() {
    return this.consumerRightsService.getConsumerRights();
  }

  @Get('return-policy')
  async getReturnPolicy() {
    return this.consumerRightsService.getReturnPolicy();
  }

  @Get('warranty/:productId')
  async getWarrantyInfo(@Param('productId') productId: string) {
    return this.consumerRightsService.getWarrantyInfo(parseInt(productId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('complaint')
  async recordConsumerComplaint(@Body() complaintData: any, @Req() req: any) {
    return this.consumerRightsService.recordConsumerComplaint(req.user.id, complaintData);
  }

  // Dispute Resolution Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('dispute')
  async initiateDispute(@Body() disputeData: any, @Req() req: any) {
    return this.disputeResolutionService.initiateDispute(req.user.id, disputeData);
  }

  @Get('dispute-process')
  getDisputeResolutionProcess() {
    return this.disputeResolutionService.getDisputeResolutionProcess();
  }

  @UseGuards(JwtAuthGuard)
  @Get('disputes')
  async getDisputeHistory(@Req() req: any) {
    return this.disputeResolutionService.getDisputeHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('dispute/:disputeId/escalate')
  async escalateDispute(@Param('disputeId') disputeId: string, @Body() body: any) {
    return this.disputeResolutionService.escalateDispute(parseInt(disputeId), body.reason);
  }
}