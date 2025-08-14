import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createChatSession(visitorId: string, userAgent?: string, ipAddress?: string) {
    return this.prisma.chatSession.create({
      data: {
        visitorId,
        userAgent,
        status: 'ACTIVE',
      },
    });
  }

  async sendMessage(sessionId: string, message: string, isFromCustomer: boolean, userId?: string) {
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        sender: isFromCustomer ? 'customer' : 'agent',
        message,
        isFromCustomer,
      },
    });

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });

    return chatMessage;
  }

  async getChatHistory(sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
    });
  }

  async getActiveSessions() {
    return this.prisma.chatSession.findMany({
      where: {
        status: 'ACTIVE',
        lastActivityAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000),
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async assignSession(sessionId: string, userId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { assignedTo: userId },
    });
  }

  async closeSession(sessionId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  async saveOfflineMessage(name: string, email: string, message: string) {
    return this.prisma.offlineMessage.create({
      data: { name, email, message },
    });
  }

  async findAutoResponse(message: string) {
    const responses = await this.prisma.chatAutoResponse.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });
    
    for (const response of responses) {
      const keywords = response.keywords.toLowerCase().split(',');
      const messageText = message.toLowerCase();
      
      if (keywords.some(keyword => messageText.includes(keyword.trim()))) {
        return response.response;
      }
    }
    
    return null;
  }
}