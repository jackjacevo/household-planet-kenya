import { Controller, Get, Post, UseGuards, Request, Response } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CsrfGuard } from '../common/guards/csrf.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';

@Controller('security')
@UseGuards(RateLimitGuard)
export class SecurityController {
  
  @Get('csrf-token')
  @RateLimit(10, 60000) // 10 requests per minute
  getCsrfToken(@Request() req, @Response() res) {
    const token = CsrfGuard.generateToken();
    req.session.csrfToken = token;
    res.json({ csrfToken: token });
  }

  @Get('health')
  @RateLimit(60, 60000) // 60 requests per minute
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Post('report-violation')
  @UseGuards(AuthGuard('jwt'))
  @RateLimit(5, 60000) // 5 reports per minute
  reportSecurityViolation(@Request() req) {
    // Log security violation report
    return { message: 'Security violation reported' };
  }
}