import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/return.dto';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async getUserReturns(userId: number) {
    return this.prisma.returnRequest.findMany({
      where: { 
        order: { userId }
      },
      include: {
        order: {
          select: {
            orderNumber: true
          }
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createReturn(userId: number, createReturnDto: CreateReturnDto) {
    // Verify order belongs to user and is eligible for return
    const order = await this.prisma.order.findFirst({
      where: {
        id: parseInt(createReturnDto.orderId),
        userId,
        status: 'DELIVERED'
      },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or not eligible for return');
    }

    // Check if return window is still open (30 days)
    const deliveryDate = new Date(order.updatedAt);
    const returnDeadline = new Date(deliveryDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (new Date() > returnDeadline) {
      throw new BadRequestException('Return window has expired');
    }

    // Validate return items
    for (const returnItem of createReturnDto.items) {
      const orderItem = order.items.find(item => item.id === parseInt(returnItem.orderItemId));
      if (!orderItem) {
        throw new BadRequestException(`Order item not found`);
      }
      if (returnItem.quantity > orderItem.quantity) {
        throw new BadRequestException('Cannot return more items than ordered');
      }
    }

    const returnNumber = `RET-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const returnRequest = await this.prisma.returnRequest.create({
      data: {
        returnNumber,
        orderId: parseInt(createReturnDto.orderId),
        type: createReturnDto.type,
        reason: createReturnDto.reason,
        preferredResolution: createReturnDto.preferredResolution,
        status: 'PENDING',
        items: {
          create: createReturnDto.items.map(item => ({
            orderItemId: parseInt(item.orderItemId),
            quantity: item.quantity,
            reason: item.reason
          }))
        }
      },
      include: {
        order: {
          select: {
            orderNumber: true
          }
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return returnRequest;
  }

  async getReturn(userId: number, returnId: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: {
          select: {
            userId: true,
            orderNumber: true
          }
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return returnRequest;
  }

  async cancelReturn(userId: number, returnId: string) {
    const returnRequest = await this.getReturn(userId, returnId);

    if (returnRequest.status !== 'PENDING') {
      throw new BadRequestException('Can only cancel pending return requests');
    }

    return this.prisma.returnRequest.update({
      where: { id: returnId },
      data: { status: 'CANCELLED' }
    });
  }
}
