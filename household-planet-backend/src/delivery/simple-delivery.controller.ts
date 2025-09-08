import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('simple-delivery')
export class SimpleDeliveryController {
  constructor(private prisma: PrismaService) {}

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
}