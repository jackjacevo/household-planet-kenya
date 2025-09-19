import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://householdplanetkenya.co.ke',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit order status update to all connected clients
  emitOrderStatusUpdate(orderData: {
    orderId: number;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
  }) {
    this.server.emit('orderStatusUpdate', orderData);
    this.logger.log(`Emitted order status update for order ${orderData.orderNumber}: ${orderData.status}`);
  }

  // Emit tracking update to specific tracking number listeners
  emitTrackingUpdate(trackingData: {
    trackingNumber: string;
    status: string;
    statusHistory: any[];
  }) {
    this.server.emit('trackingUpdate', trackingData);
    this.logger.log(`Emitted tracking update for ${trackingData.trackingNumber}: ${trackingData.status}`);
  }
}
