import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, CreateMessageDto } from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async getUserTickets(userId: number) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tickets.map(ticket => ({
      ...ticket,
      message: ticket.description,
      responses: ticket.messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        isStaff: !msg.isFromCustomer,
        createdAt: msg.createdAt
      }))
    }));
  }

  async createTicket(userId: number, createTicketDto: CreateTicketDto) {
    const ticketNumber = `HP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: createTicketDto.subject,
        category: createTicketDto.category || 'OTHER',
        priority: createTicketDto.priority,
        description: createTicketDto.message,
        orderId: createTicketDto.orderId,
        status: 'OPEN',
        messages: {
          create: {
            message: createTicketDto.message,
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

  async getTicket(userId: number, ticketId: string) {
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

    if (ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async addMessage(userId: number, ticketId: string, createMessageDto: CreateMessageDto) {
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

  async closeTicket(userId: number, ticketId: string) {
    const ticket = await this.getTicket(userId, ticketId);

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' }
    });
  }
}
