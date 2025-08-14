import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Public()
  @Post('session')
  async createSession(@Body() body: {
    visitorId: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.chatService.createChatSession(
      body.visitorId,
      body.userAgent,
      body.ipAddress
    );
  }

  @Public()
  @Post('message')
  async sendMessage(@Body() body: {
    sessionId: string;
    message: string;
    isFromCustomer: boolean;
  }) {
    const autoResponse = await this.chatService.findAutoResponse(body.message);
    
    const message = await this.chatService.sendMessage(
      body.sessionId,
      body.message,
      body.isFromCustomer
    );

    let response = null;
    if (autoResponse && body.isFromCustomer) {
      response = await this.chatService.sendMessage(
        body.sessionId,
        autoResponse,
        false
      );
    }

    return { message, autoResponse: response };
  }

  @Public()
  @Get('history/:sessionId')
  async getChatHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getChatHistory(sessionId);
  }

  @Public()
  @Post('offline')
  async saveOfflineMessage(@Body() body: {
    name: string;
    email: string;
    message: string;
  }) {
    return this.chatService.saveOfflineMessage(body.name, body.email, body.message);
  }

  @Get('sessions/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getActiveSessions() {
    return this.chatService.getActiveSessions();
  }

  @Post('sessions/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async assignSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: any
  ) {
    return this.chatService.assignSession(sessionId, user.id);
  }

  @Post('sessions/:id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async closeSession(@Param('id') sessionId: string) {
    return this.chatService.closeSession(sessionId);
  }

  @Post('staff/message')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendStaffMessage(
    @Body() body: { sessionId: string; message: string },
    @CurrentUser() user: any
  ) {
    return this.chatService.sendMessage(
      body.sessionId,
      body.message,
      false,
      user.id
    );
  }
}