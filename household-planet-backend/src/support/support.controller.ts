import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  createTicket(@CurrentUser('id') userId: string, @Body() data: {
    subject: string;
    message: string;
    category: string;
    priority?: string;
    orderId?: string;
  }) {
    return this.supportService.createTicket(userId, data);
  }

  @Get('tickets')
  getUserTickets(@CurrentUser('id') userId: string) {
    return this.supportService.getUserTickets(userId);
  }

  @Get('tickets/:ticketId')
  getTicket(@CurrentUser('id') userId: string, @Param('ticketId') ticketId: string) {
    return this.supportService.getTicketById(userId, ticketId);
  }

  @Post('tickets/:ticketId/replies')
  addReply(
    @CurrentUser('id') userId: string,
    @Param('ticketId') ticketId: string,
    @Body() data: { message: string }
  ) {
    return this.supportService.addReply(userId, ticketId, data.message);
  }
}