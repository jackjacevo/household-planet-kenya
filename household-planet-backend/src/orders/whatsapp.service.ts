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
      const subtotal = dto.estimatedTotal || 0;
      const shippingCost = dto.deliveryCost;
      const total = subtotal + shippingCost;
      
      const order = await this.prisma.order.create({
        data: {
          userId: user.id,
          orderNumber,
          subtotal,
          shippingCost,
          total,
          shippingAddress: JSON.stringify({
            fullName: dto.customerName,
            phone: dto.customerPhone,
            street: dto.deliveryLocation || 'Manual Entry',
            town: dto.deliveryLocation || 'Manual Entry',
            county: 'Manual Entry'
          }),
          deliveryLocation: dto.deliveryLocation || 'Manual Entry',
          paymentMethod: 'CASH_ON_DELIVERY',
          status: 'PENDING',
          source: 'WHATSAPP'
        }
      });

      // Add order note with WhatsApp details
      await this.prisma.orderNote.create({
        data: {
          orderId: order.id,
          note: `📱 WhatsApp Order Details:\n${dto.orderDetails}\n\n💳 Payment: ${dto.paymentMode}\n🚚 Type: ${dto.deliveryType}\n🚛 Delivery Cost: KSh ${dto.deliveryCost}${dto.deliveryLocation ? `\n📍 Location: ${dto.deliveryLocation}` : ''}${dto.notes ? `\n\n📝 Additional Notes:\n${dto.notes}` : ''}`,
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
      
      // Enhanced order detection patterns
      const orderKeywords = ['order', 'buy', 'purchase', 'want', 'need', 'interested', 'availability', 'delivery'];
      const isOrderMessage = orderKeywords.some(keyword => message.includes(keyword));

      // Check if this message relates to a recent product inquiry
      const recentInquiry = await this.findRecentProductInquiry(dto.body);

      if (isOrderMessage || recentInquiry) {
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
          message: 'Order message detected and logged for processing',
          relatedProduct: recentInquiry
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

  private async findRecentProductInquiry(message: string) {
    // Look for product names or SKUs in the message
    const recentInquiries = await this.prisma.analyticsEvent.findMany({
      where: {
        event: 'whatsapp_product_inquiry',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    for (const inquiry of recentInquiries) {
      const properties = JSON.parse(inquiry.properties);
      const productName = properties.productName?.toLowerCase();
      const sku = properties.sku?.toLowerCase();
      
      if ((productName && message.includes(productName)) || 
          (sku && message.includes(sku))) {
        return properties;
      }
    }

    return null;
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

  async getWhatsAppOrders() {
    return this.prisma.order.findMany({
      where: {
        source: 'WHATSAPP'
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, images: true } },
            variant: { select: { name: true, sku: true } },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
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