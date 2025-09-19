import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private notificationsGateway: NotificationsGateway) {}

  async sendOrderUpdate(orderData: {
    orderId: number;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
  }) {
    // Emit real-time update via WebSocket
    this.notificationsGateway.emitOrderStatusUpdate(orderData);
    
    // Also emit tracking update if tracking number exists
    if (orderData.trackingNumber) {
      this.notificationsGateway.emitTrackingUpdate({
        trackingNumber: orderData.trackingNumber,
        status: orderData.status,
        statusHistory: [] // Will be populated by the calling service
      });
    }
    
    console.log(`Order ${orderData.orderNumber} status: ${orderData.status}`);
  }

  async sendTrackingUpdate(trackingData: {
    trackingNumber: string;
    status: string;
    statusHistory: any[];
  }) {
    this.notificationsGateway.emitTrackingUpdate(trackingData);
  }
}
