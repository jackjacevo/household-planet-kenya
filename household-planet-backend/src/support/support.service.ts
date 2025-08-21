import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, CreateMessageDto } from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId: parseInt(userId) },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTicket(userId: string, createTicketDto: CreateTicketDto) {
    const ticketNumber = `HP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: parseInt(userId),
        subject: createTicketDto.subject,
        category: createTicketDto.category,
        priority: createTicketDto.priority,
        description: createTicketDto.description,
        orderId: createTicketDto.orderId,
        status: 'OPEN',
        messages: {
          create: {
            message: createTicketDto.description,
            isFromCustomer: true
          }
        }
      },
      include: {
        messages: true
      }
    });

    return ticket;
  }

  async getTicket(userId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== parseInt(userId)) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async addMessage(userId: string, ticketId: string, createMessageDto: CreateMessageDto) {
    const ticket = await this.getTicket(userId, ticketId);

    if (ticket.status === 'CLOSED') {
      throw new ForbiddenException('Cannot add message to closed ticket');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        message: createMessageDto.message,
        isFromCustomer: true,
        attachments: JSON.stringify(createMessageDto.attachments)
      }
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    if (ticket.status === 'OPEN') {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return message;
  }

  async closeTicket(userId: string, ticketId: string) {
    const ticket = await this.getTicket(userId, ticketId);

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' }
    });
  }
}