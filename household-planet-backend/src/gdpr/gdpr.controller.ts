import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GdprService } from './gdpr.service';
import { CookieConsentDto, DataExportRequestDto, DataDeletionRequestDto, ConsentUpdateDto, PrivacySettingsDto } from './dto/gdpr.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';

@Controller('gdpr')
@UseGuards(RateLimitGuard)
export class GdprController {
  constructor(private gdprService: GdprService) {}

  @Post('cookie-consent')
  @RateLimit(10, 60000)
  updateCookieConsent(@Request() req, @Body() consentDto: CookieConsentDto) {
    const userId = req.user?.userId || req.sessionID || 'anonymous';
    return this.gdprService.updateCookieConsent(userId, consentDto);
  }

  @Get('cookie-consent')
  getCookieConsent(@Request() req) {
    const userId = req.user?.userId || req.sessionID || 'anonymous';
    return this.gdprService.getCookieConsent(userId);
  }

  @Post('data-export')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(1, 3600000) // 1 request per hour
  async requestDataExport(@Request() req, @Body() requestDto: DataExportRequestDto, @Res() res: Response) {
    const exportData = await this.gdprService.requestDataExport(req.user.userId, requestDto);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="data-export-${req.user.userId}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  }

  @Post('data-deletion')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(1, 86400000) // 1 request per day
  requestDataDeletion(@Request() req, @Body() requestDto: DataDeletionRequestDto) {
    return this.gdprService.requestDataDeletion(req.user.userId, requestDto);
  }

  @Delete('data-deletion/:requestId')
  @UseGuards(AuthGuard('jwt'))
  cancelDataDeletion(@Request() req, @Param('requestId') requestId: string) {
    return this.gdprService.cancelDataDeletion(req.user.userId, requestId);
  }

  @Put('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  updatePrivacySettings(@Request() req, @Body() settingsDto: PrivacySettingsDto) {
    return this.gdprService.updatePrivacySettings(req.user.userId, settingsDto);
  }

  @Get('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  getPrivacySettings(@Request() req) {
    return this.gdprService.getPrivacySettings(req.user.userId);
  }

  @Post('consent')
  @UseGuards(AuthGuard('jwt'))
  updateConsent(@Request() req, @Body() consentDto: ConsentUpdateDto) {
    return this.gdprService.updateConsent(req.user.userId, consentDto);
  }

  @Get('consent-history')
  @UseGuards(AuthGuard('jwt'))
  getConsentHistory(@Request() req) {
    return this.gdprService.getConsentHistory(req.user.userId);
  }
}
