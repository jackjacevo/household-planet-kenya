import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService } from './support.service';
import { CreateTicketDto, CreateMessageDto } from './dto/support.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { SecurityGuard } from '../common/guards/security.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { ApiVersion } from '../common/decorators/api-version.decorator';
import { ApiSecurity } from '../common/decorators/api-security.decorator';

@Controller('support')
@ApiVersion('v1')
@ApiSecurity({ requireAuth: true, auditLog: true })
@UseGuards(AuthGuard('jwt'), RateLimitGuard, SecurityGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Get('tickets')
  getUserTickets(@Request() req) {
    return this.supportService.getUserTickets(req.user.id);
  }

  @Post('tickets')
  @RateLimit(5, 60000) // 5 tickets per minute
  @ApiSecurity({ sensitiveData: true, auditLog: true })
  createTicket(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.id, createTicketDto);
  }

  @Get('tickets/:id')
  getTicket(@Request() req, @Param('id') ticketId: string) {
    return this.supportService.getTicket(req.user.id, ticketId);
  }

  @Post('tickets/:id/messages')
  @RateLimit(10, 60000) // 10 messages per minute
  addMessage(@Request() req, @Param('id') ticketId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.supportService.addMessage(req.user.id, ticketId, createMessageDto);
  }

  @Post('tickets/:id/reply')
  @RateLimit(10, 60000) // 10 messages per minute
  addReply(@Request() req, @Param('id') ticketId: string, @Body() createMessageDto: CreateMessageDto) {
    return this.supportService.addMessage(req.user.id, ticketId, createMessageDto);
  }

  @Put('tickets/:id/close')
  closeTicket(@Request() req, @Param('id') ticketId: string) {
    return this.supportService.closeTicket(req.user.id, ticketId);
  }
}