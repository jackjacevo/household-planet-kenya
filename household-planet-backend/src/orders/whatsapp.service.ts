import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWhatsAppOrderDto, WhatsAppWebhookDto } from './dto/order.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly WHATSAPP_USER_PASSWORD = process.env.WHATSAPP_USER_PASSWORD || 'whatsapp-default';
  private readonly WHATSAPP_SYSTEM_USER = process.env.WHATSAPP_SYSTEM_USER || 'whatsapp-system';
  
  constructor(private prisma: PrismaService) {}

  async createWhatsAppOrder(dto: CreateWhatsAppOrderDto) {
    try {
      // Find or create customer by phone
      let user = await this.prisma.user.findFirst({
        where: { phone: dto.customerPhone }
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(this.WHATSAPP_USER_PASSWORD, 10);
        user = await this.prisma.user.create({
          data: {
            name: dto.customerName,
            phone: dto.customerPhone,
            email: `${dto.customerPhone}@whatsapp.temp`,
            password: hashedPassword,
            role: 'CUSTOMER'
          }
        });
      }

      // Create order with WhatsApp source
      const orderNumber = `WA-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
      const order = await this.prisma.order.create({
        data: {
          userId: user.id,
          orderNumber,
          subtotal: dto.estimatedTotal || 0,
          shippingCost: 0,
          total: dto.estimatedTotal || 0,
          shippingAddress: JSON.stringify({
            fullName: dto.customerName,
            phone: dto.customerPhone,
            street: dto.shippingAddress,
            town: dto.deliveryLocation || 'Unknown',
            county: 'Unknown'
          }),
          deliveryLocation: dto.deliveryLocation,
          paymentMethod: 'CASH_ON_DELIVERY',
          status: 'PENDING',
          source: 'WHATSAPP'
        }
      });

      // Add order note with WhatsApp details
      await this.prisma.orderNote.create({
        data: {
          orderId: order.id,
          note: `WhatsApp Order Details: ${dto.orderDetails}${dto.notes ? `\nAdditional Notes: ${dto.notes}` : ''}`,
          isInternal: false,
          createdBy: this.WHATSAPP_SYSTEM_USER
        }
      });

      return order;
    } catch (error) {
      this.logger.error('Error creating WhatsApp order', error.stack);
      throw error;
    }
  }

  async processWhatsAppWebhook(dto: WhatsAppWebhookDto) {
    try {
      if (!dto.from || !dto.body) {
        throw new BadRequestException('Invalid webhook data');
      }
      
      const message = dto.body.toLowerCase();
      
      // Simple order detection patterns
      const orderKeywords = ['order', 'buy', 'purchase', 'want', 'need'];
      const isOrderMessage = orderKeywords.some(keyword => message.includes(keyword));

      if (isOrderMessage) {
        // Log the potential order for manual review
        await this.prisma.whatsAppMessage.create({
          data: {
            phoneNumber: dto.from,
            message: dto.body,
            timestamp: new Date(dto.timestamp),
            messageId: dto.messageId,
            isOrderCandidate: true,
            processed: false
          }
        });

        return { 
          isOrder: true, 
          message: 'Order message detected and logged for processing' 
        };
      }

      return { 
        isOrder: false, 
        message: 'Regular message received' 
      };
    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook', error.stack);
      throw error;
    }
  }

  async getPendingWhatsAppMessages() {
    return this.prisma.whatsAppMessage.findMany({
      where: {
        isOrderCandidate: true,
        processed: false
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  async markMessageProcessed(messageId: string, orderId?: number) {
    if (!messageId) {
      throw new BadRequestException('Message ID is required');
    }
    
    return this.prisma.whatsAppMessage.update({
      where: { messageId },
      data: {
        processed: true,
        orderId
      }
    });
  }

  parseOrderMessage(message: string) {
    // Basic parsing logic - can be enhanced with AI/NLP
    const lines = message.split('\n');
    const items = [];
    let customerInfo = {};

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract phone numbers
      const phoneMatch = trimmed.match(/(\+254|0)[0-9]{9}/);
      if (phoneMatch) {
        customerInfo['phone'] = phoneMatch[0];
      }

      // Extract items (simple pattern matching)
      const itemMatch = trimmed.match(/(\d+)\s*x?\s*(.+)/i);
      if (itemMatch) {
        items.push({
          quantity: parseInt(itemMatch[1]),
          description: itemMatch[2]
        });
      }
    }

    return { items, customerInfo };
  }
}