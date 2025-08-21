import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LegalService } from './legal.service';
import { CreateLegalAgreementDto, LegalDocumentRequestDto } from './dto/legal.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { SecurityGuard } from '../common/guards/security.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { ApiVersion } from '../common/decorators/api-version.decorator';
import { ApiSecurity } from '../common/decorators/api-security.decorator';

@Controller('legal')
@ApiVersion('v1')
@UseGuards(RateLimitGuard, SecurityGuard)
export class LegalController {
  constructor(private legalService: LegalService) {}

  @Get('documents')
  @RateLimit(20, 60000) // 20 requests per minute
  getLegalDocuments(@Query() query: any) {
    return this.legalService.getLegalDocuments(query);
  }

  @Get('documents/:type')
  @RateLimit(10, 60000) // 10 requests per minute
  getLegalDocument(@Param('type') type: string, @Query('version') version?: string) {
    return this.legalService.getLegalDocument(type, version);
  }

  @Post('agreements')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(5, 60000) // 5 agreements per minute
  @ApiSecurity({ requireAuth: true, auditLog: true })
  createLegalAgreement(@Request() req, @Body() createLegalAgreementDto: CreateLegalAgreementDto) {
    return this.legalService.createLegalAgreement(req.user.userId, createLegalAgreementDto);
  }

  @Get('agreements')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(10, 60000) // 10 requests per minute
  getUserAgreements(@Request() req) {
    return this.legalService.getUserAgreements(req.user.userId);
  }

  @Post('document-requests')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(3, 60000) // 3 requests per minute
  @ApiSecurity({ requireAuth: true, auditLog: true })
  requestLegalDocument(@Request() req, @Body() requestDto: LegalDocumentRequestDto) {
    return this.legalService.requestLegalDocument(req.user.userId, requestDto);
  }

  @Get('compliance-status')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(5, 60000) // 5 requests per minute
  getComplianceStatus(@Request() req) {
    return this.legalService.getComplianceStatus(req.user.userId);
  }

  @Get('privacy-rights')
  @RateLimit(10, 60000) // 10 requests per minute
  getPrivacyRights() {
    return this.legalService.getPrivacyRights();
  }

  @Post('consent-withdrawal')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(5, 60000) // 5 requests per minute
  @ApiSecurity({ requireAuth: true, auditLog: true })
  withdrawConsent(@Request() req, @Body() body: { consentType: string; reason?: string }) {
    return this.legalService.withdrawConsent(req.user.userId, body.consentType, body.reason);
  }
}