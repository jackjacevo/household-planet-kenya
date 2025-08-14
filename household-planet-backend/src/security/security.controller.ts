import { Controller, Get, Post, Req, Res, UseGuards, Body, Param, Query, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { CsrfService } from './csrf.service';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('security')
export class SecurityController {
  constructor(
    private csrfService: CsrfService,
    private securityService: SecurityService,
    @Inject('SentryMonitoringService') private sentryService: any,
    @Inject('VulnerabilityScanner') private vulnerabilityScanner: any,
    @Inject('IncidentResponseService') private incidentResponseService: any,
    @Inject('SecurityTrainingService') private securityTrainingService: any,
  ) {}

  @Get('csrf-token')
  @Public()
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.session?.id || req.get('X-Session-ID') || 'anonymous';
    const token = this.csrfService.generateToken(sessionId);
    
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Allow JavaScript access for CSRF token
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });
    
    res.json({ csrfToken: token });
  }

  @Get('health')
  @Public()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      security: {
        https: process.env.NODE_ENV === 'production',
        headers: 'enabled',
        rateLimit: 'enabled',
        validation: 'enabled'
      }
    };
  }

  @Post('report-violation')
  @Public()
  reportSecurityViolation(@Req() req: Request) {
    const violation = req.body;
    
    this.securityService.logSecurityEvent('CSP_VIOLATION', {
      violation,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return { status: 'reported' };
  }

  // Security Monitoring Endpoints
  @Post('incident')
  @UseGuards(JwtAuthGuard)
  async reportSecurityIncident(@Body() incidentData: any, @Req() req: any) {
    return this.incidentResponseService.reportSecurityIncident({
      ...incidentData,
      reportedBy: req.user.id,
    });
  }

  @Get('incident-response-plan')
  @UseGuards(JwtAuthGuard)
  getIncidentResponsePlan() {
    return this.incidentResponseService.getIncidentResponsePlan();
  }

  @Get('audit-log')
  @UseGuards(JwtAuthGuard)
  async getSecurityAuditLog(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.incidentResponseService.getSecurityAuditLog(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('security-report/:period')
  @UseGuards(JwtAuthGuard)
  async generateSecurityReport(@Param('period') period: 'daily' | 'weekly' | 'monthly') {
    return this.incidentResponseService.generateSecurityReport(period);
  }

  // Vulnerability Scanning Endpoints
  @Post('scan/dependencies')
  @UseGuards(JwtAuthGuard)
  async scanDependencies() {
    return this.vulnerabilityScanner.scanDependencies();
  }

  @Post('scan/code-patterns')
  @UseGuards(JwtAuthGuard)
  async scanCodePatterns() {
    return this.vulnerabilityScanner.scanCodePatterns();
  }

  @Post('scan/configuration')
  @UseGuards(JwtAuthGuard)
  async scanConfiguration() {
    return this.vulnerabilityScanner.scanConfiguration();
  }

  // Security Training Endpoints
  @Get('training/modules')
  @UseGuards(JwtAuthGuard)
  async getTrainingModules() {
    return this.securityTrainingService.getTrainingModules();
  }

  @Post('training/:moduleId/complete')
  @UseGuards(JwtAuthGuard)
  async completeTraining(
    @Param('moduleId') moduleId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.securityTrainingService.recordTrainingCompletion(
      req.user.id,
      moduleId,
      body.score,
    );
  }

  @Get('training/status')
  @UseGuards(JwtAuthGuard)
  async getTrainingStatus(@Req() req: any) {
    return this.securityTrainingService.getTrainingStatus(req.user.id);
  }

  @Get('training/report')
  @UseGuards(JwtAuthGuard)
  async generateTrainingReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.securityTrainingService.generateTrainingReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}