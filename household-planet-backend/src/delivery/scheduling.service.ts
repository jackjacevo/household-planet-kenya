import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  private timeSlots = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM', 
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM'
  ];

  async scheduleDelivery(orderId: string, preferredDate: Date, timeSlot: string, instructions?: string) {
    if (!this.timeSlots.includes(timeSlot)) {
      throw new BadRequestException('Invalid time slot');
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (preferredDate < tomorrow) {
      throw new BadRequestException('Delivery date must be at least tomorrow');
    }

    return this.prisma.deliverySchedule.create({
      data: { orderId, preferredDate, timeSlot, instructions }
    });
  }

  async rescheduleDelivery(orderId: string, newDate: Date, newTimeSlot: string) {
    return this.prisma.deliverySchedule.update({
      where: { orderId },
      data: { 
        preferredDate: newDate, 
        timeSlot: newTimeSlot,
        isRescheduled: true
      }
    });
  }

  async getAvailableSlots(date: Date) {
    return this.timeSlots;
  }

  async getSchedule(orderId: string) {
    return this.prisma.deliverySchedule.findUnique({
      where: { orderId }
    });
  }
}