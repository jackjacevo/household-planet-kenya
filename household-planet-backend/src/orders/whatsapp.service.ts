import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderIdService } from './order-id.service';
import { ActivityService } from '../activity/activity.service';
import { CreateWhatsAppOrderDto, WhatsAppWebhookDto } from './dto/order.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly WHATSAPP_USER_PASSWORD = process.env.WHATSAPP_USER_PASSWORD || 'whatsapp-default';
  private readonly WHATSAPP_SYSTEM_USER = process.env.WHATSAPP_SYSTEM_USER || 'whatsapp-system';
  
  constructor(
    private prisma: PrismaService,
    private orderIdService: OrderIdService,
    private activityService: ActivityService
  ) {}

  async createWhatsAppOrder(dto: CreateWhatsAppOrderDto, adminUserId?: number) {
    try {
      // Determine email to use
      const customerEmail = dto.customerEmail && dto.customerEmail.trim() 
        ? dto.customerEmail.trim() 
        : `${dto.customerPhone}@whatsapp.temp`;

      // Find or create customer by phone or email
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { phone: dto.customerPhone },
            { email: customerEmail }
          ]
        }
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(this.WHATSAPP_USER_PASSWORD, 10);
        user = await this.prisma.user.create({
          data: {
            name: dto.customerName,
            phone: dto.customerPhone,
            email: customerEmail,
            password: hashedPassword,
            role: 'CUSTOMER'
          }
        });
      } else if (user.email !== customerEmail) {
        // Update user with current email and name
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            email: customerEmail,
            name: dto.customerName
          }
        });
      }

      // Ensure customer profile exists
      await this.prisma.customerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          totalSpent: 0,
          totalOrders: 0,
          averageOrderValue: 0
        }
      });

      // Create order with WhatsApp source
      const orderNumber = await this.orderIdService.generateOrderId('WHATSAPP');
      // Generate tracking number for WhatsApp orders
      const trackingNumber = `TRK-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
      const subtotal = dto.estimatedTotal || 0;
      const shippingCost = dto.deliveryType === 'PICKUP' ? 0 : dto.deliveryCost;
      const total = subtotal + shippingCost;
      
      const deliveryLocation = dto.deliveryType === 'PICKUP' ? 'Store Pickup' : (dto.deliveryLocation || 'Manual Entry');
      
      const order = await this.prisma.order.create({
        data: {
          userId: user.id,
          orderNumber,
          trackingNumber,
          subtotal,
          shippingCost,
          total,
          shippingAddress: JSON.stringify({
            fullName: dto.customerName,
            phone: dto.customerPhone,
            street: deliveryLocation,
            town: deliveryLocation,
            county: dto.deliveryType === 'PICKUP' ? 'Store Pickup' : 'Manual Entry'
          }),
          deliveryLocation,
          paymentMethod: 'CASH_ON_DELIVERY',
          status: 'PENDING',
          source: 'WHATSAPP'
        }
      });

      // Add order note with WhatsApp details
      const emailNote = `\n📧 Customer Email: ${customerEmail}`;
      
      const deliveryInfo = dto.deliveryType === 'PICKUP' 
        ? '🏪 Customer will pickup from store (No delivery cost)'
        : `🚛 Delivery Cost: KSh ${dto.deliveryCost}${dto.deliveryLocation ? `\n📍 Location: ${dto.deliveryLocation}` : ''}`;
      
      await this.prisma.orderNote.create({
        data: {
          orderId: order.id,
          note: `📱 WhatsApp Order Details:\n${dto.orderDetails}${emailNote}\n\n💳 Payment: ${dto.paymentMode}\n🚚 Type: ${dto.deliveryType}\n${deliveryInfo}${dto.notes ? `\n\n📝 Additional Notes:\n${dto.notes}` : ''}`,
          isInternal: false,
          createdBy: this.WHATSAPP_SYSTEM_USER
        }
      });

      // Log admin activity
      if (adminUserId) {
        try {
          await this.activityService.logActivity(
            adminUserId,
            'CREATE_WHATSAPP_ORDER',
            {
              orderNumber: order.orderNumber,
              customerName: dto.customerName,
              customerPhone: dto.customerPhone,
              total: total,
              deliveryLocation: dto.deliveryLocation
            },
            'ORDER',
            order.id
          );
        } catch (activityError) {
          this.logger.error('Failed to log WhatsApp order creation activity:', activityError);
        }
      }

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
