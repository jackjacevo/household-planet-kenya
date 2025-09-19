import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

export interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  carrier: string;
  estimatedDelivery: Date;
  cost: number;
}

export interface TrackingUpdate {
  status: string;
  location: string;
  timestamp: Date;
  description: string;
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly BASE_SHIPPING_COST = 200;
  private readonly CARRIERS = ['DHL', 'G4S', 'Fargo Courier', 'Household Planet Delivery'];

  constructor(private prisma: PrismaService) {}

  async generateShippingLabel(orderId: number): Promise<ShippingLabel> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          delivery: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if shipping label already exists
      if (order.trackingNumber && order.delivery) {
        this.logger.log(`Shipping label already exists for order ${orderId}, returning existing label`);
        
        const carrier = this.selectCarrier(Number(order.total), order.deliveryLocation);
        const deliveryDays = this.calculateDeliveryDays(order.deliveryLocation);
        const estimatedDelivery = order.delivery.scheduledDate || new Date();
        
        return {
          trackingNumber: order.trackingNumber,
          labelUrl: `${process.env.API_URL || 'https://api.householdplanetkenya.co.ke'}/shipping/labels/${order.trackingNumber}.pdf`,
          carrier,
          estimatedDelivery,
          cost: this.BASE_SHIPPING_COST
        };
      }

      // Generate unique tracking number
      const trackingNumber = `HP${Date.now()}${randomBytes(3).toString('hex').toUpperCase()}`;
      
      // Select carrier based on order value and location
      const carrier = this.selectCarrier(Number(order.total), order.deliveryLocation);
      
      // Calculate estimated delivery (2-5 business days)
      const deliveryDays = this.calculateDeliveryDays(order.deliveryLocation);
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

      // Update order with tracking number
      await this.prisma.order.update({
        where: { id: orderId },
        data: { trackingNumber }
      });

      // Create or update delivery record
      await this.prisma.delivery.upsert({
        where: { orderId },
        update: {
          trackingNumber,
          status: 'LABEL_CREATED',
          scheduledDate: estimatedDelivery
        },
        create: {
          orderId,
          trackingNumber,
          status: 'LABEL_CREATED',
          scheduledDate: estimatedDelivery
        }
      });

      // Add initial tracking status
      await this.addTrackingUpdate(trackingNumber, {
        status: 'LABEL_CREATED',
        location: 'Nairobi Warehouse',
        timestamp: new Date(),
        description: 'Shipping label created, package ready for pickup'
      });

      return {
        trackingNumber,
        labelUrl: `${process.env.API_URL || 'https://api.householdplanetkenya.co.ke'}/shipping/labels/${trackingNumber}.pdf`,
        carrier,
        estimatedDelivery,
        cost: this.BASE_SHIPPING_COST
      };
    } catch (error) {
      this.logger.error('Error generating shipping label', error.stack);
      throw error;
    }
  }

  async updateTracking(trackingNumber: string, update: TrackingUpdate): Promise<void> {
    try {
      // Update delivery status
      await this.prisma.delivery.update({
        where: { trackingNumber },
        data: { status: update.status }
      });

      // Add tracking history
      await this.addTrackingUpdate(trackingNumber, update);

      // Update order status based on tracking status
      if (update.status === 'DELIVERED') {
        const delivery = await this.prisma.delivery.findUnique({
          where: { trackingNumber },
          include: { order: true }
        });

        if (delivery) {
          await this.prisma.order.update({
            where: { id: delivery.orderId },
            data: { status: 'DELIVERED' }
          });
        }
      }
    } catch (error) {
      this.logger.error('Error updating tracking', error.stack);
      throw error;
    }
  }

  async getTrackingInfo(trackingNumber: string) {
    try {
      const delivery = await this.prisma.delivery.findUnique({
        where: { trackingNumber },
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
              total: true,
              user: {
                select: { name: true, email: true }
              }
            }
          },
          statusHistory: {
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      if (!delivery) {
        throw new Error('Tracking number not found');
      }

      return {
        trackingNumber,
        status: delivery.status,
        order: delivery.order,
        estimatedDelivery: delivery.scheduledDate,
        trackingHistory: delivery.statusHistory
      };
    } catch (error) {
      this.logger.error('Error getting tracking info', error.stack);
      throw error;
    }
  }

  private async addTrackingUpdate(trackingNumber: string, update: TrackingUpdate): Promise<void> {
    try {
      const delivery = await this.prisma.delivery.findUnique({
        where: { trackingNumber }
      });

      if (delivery) {
        await this.prisma.deliveryStatusHistory.create({
          data: {
            deliveryId: delivery.id,
            status: update.status,
            notes: `${update.location}: ${update.description}`,
            timestamp: update.timestamp
          }
        });
      } else {
        this.logger.warn(`Delivery record not found for tracking number: ${trackingNumber}`);
      }
    } catch (error) {
      this.logger.error('Error adding tracking update', error.stack);
    }
  }

  private selectCarrier(orderValue: number, location?: string): string {
    // High-value orders use premium carriers
    if (orderValue > 10000) {
      return 'DHL';
    }
    
    // Nairobi orders can use G4S
    if (location?.toLowerCase().includes('nairobi')) {
      return 'G4S';
    }
    
    // Default to Household Planet Delivery
    return 'Household Planet Delivery';
  }

  private calculateDeliveryDays(location?: string): number {
    if (!location) return 3;
    
    const loc = location.toLowerCase();
    
    // Same day/next day for Nairobi
    if (loc.includes('nairobi')) return 1;
    
    // Major cities - 2 days
    if (loc.includes('mombasa') || loc.includes('kisumu') || loc.includes('nakuru')) {
      return 2;
    }
    
    // Remote areas - 5 days
    return 5;
  }

  // Simulate tracking updates for demo
  async simulateTrackingUpdates(trackingNumber: string): Promise<void> {
    const updates: TrackingUpdate[] = [
      {
        status: 'PICKED_UP',
        location: 'Nairobi Warehouse',
        timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        description: 'Package picked up from warehouse'
      },
      {
        status: 'IN_TRANSIT',
        location: 'Nairobi Sorting Center',
        timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours later
        description: 'Package in transit to destination'
      },
      {
        status: 'OUT_FOR_DELIVERY',
        location: 'Local Delivery Hub',
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
        description: 'Package out for delivery'
      },
      {
        status: 'DELIVERED',
        location: 'Customer Address',
        timestamp: new Date(Date.now() + 26 * 60 * 60 * 1000), // 26 hours later
        description: 'Package delivered successfully'
      }
    ];

    // Schedule updates (in real implementation, these would be triggered by carrier webhooks)
    for (const update of updates) {
      setTimeout(async () => {
        await this.updateTracking(trackingNumber, update);
      }, update.timestamp.getTime() - Date.now());
    }
  }
}
