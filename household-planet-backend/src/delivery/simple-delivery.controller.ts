import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryLocationsService } from './delivery-locations.service';

@Controller('simple-delivery')
export class SimpleDeliveryController {
  constructor(
    private prisma: PrismaService,
    private deliveryLocationsService: DeliveryLocationsService
  ) {}

  @Get('track/:trackingNumber')
  async trackOrder(@Param('trackingNumber') trackingNumber: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: { trackingNumber },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: true }
              },
              variant: {
                select: { name: true }
              }
            }
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!order) {
        return {
          success: false,
          message: 'Order not found with this tracking number'
        };
      }

      let parsedShippingAddress = null;
      if (order.shippingAddress) {
        try {
          parsedShippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          console.log('Error parsing shippingAddress:', e);
        }
      }

      return {
        success: true,
        data: {
          ...order,
          shippingAddress: parsedShippingAddress
        }
      };
    } catch (error) {
      throw new NotFoundException('Unable to fetch tracking information');
    }
  }

  @Get('locations')
  async getDeliveryLocations() {
    try {
      const locations = await this.deliveryLocationsService.getAllLocations();
      return {
        success: true,
        data: locations
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to fetch delivery locations'
      };
    }
  }

  @Get('locations/tier/:tier')
  async getLocationsByTier(@Param('tier') tier: string) {
    try {
      const tierNumber = parseInt(tier);
      const locations = await this.deliveryLocationsService.getLocationsByTier(tierNumber);
      return {
        success: true,
        data: locations
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to fetch delivery locations for tier'
      };
    }
  }
}