import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CsrfProtectionService } from './csrf-protection.service';
import { SkipCsrf } from './decorators/skip-csrf.decorator';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfProtectionService) {}

  @Get('token')
  @SkipCsrf()
  getToken(@Req() request: any, @Res() response: any) {
    const sessionId = request.session?.id || request.cookies?.sessionId;
    
    if (!sessionId) {
      return response.status(400).json({ error: 'Session required' });
    }
    
    const token = this.csrfService.generateToken(sessionId);
    
    // Set double-submit cookie
    const doubleSubmitToken = this.csrfService.generateDoubleSubmitToken();
    response.cookie('csrf-token', doubleSubmitToken, {
      httpOnly: false, // Needs to be accessible to JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });
    
    return response.json({ 
      csrfToken: token,
      doubleSubmitToken 
    });
  }
}