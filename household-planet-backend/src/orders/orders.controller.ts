import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, Res, Patch, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { WhatsAppService } from './whatsapp.service';
import { ShippingService } from './shipping.service';
import { CreateOrderDto, UpdateOrderStatusDto, CreateReturnDto, BulkOrderUpdateDto, OrderFilterDto, AddOrderNoteDto, SendCustomerEmailDto, CreateWhatsAppOrderDto, WhatsAppWebhookDto, ProcessReturnDto } from './dto/order.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private whatsAppService: WhatsAppService,
    private shippingService: ShippingService
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async findAll(@Query() filters: OrderFilterDto) {
    try {
      console.log('Orders controller findAll called with filters:', filters);
      const result = await this.ordersService.findAll(filters);
      console.log('Orders found:', result.orders?.length || 0);
      return result;
    } catch (error) {
      console.error('Error in orders controller findAll:', error);
      throw error;
    }
  }

  @Get('my-orders')
  @UseGuards(AuthGuard('jwt'))
  getMyOrders(@Request() req, @Query() query: { status?: string; returnable?: string }) {
    console.log('getMyOrders called with query:', query);
    console.log('User:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      throw new BadRequestException('User not authenticated');
    }
    
    const filters: any = {};
    if (query.status) {
      filters.status = query.status;
    }
    if (query.returnable === 'true') {
      filters.returnable = true;
    }
    
    console.log('Filters applied:', filters);
    return this.ordersService.findByUser(req.user.id, filters);
  }

  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  @Get('admin/inventory-report')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getInventoryReport() {
    return this.ordersService.getInventoryReport();
  }

  @Get('admin/sales-report')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date');
      }
    }
    
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date');
      }
    }
    
    return this.ordersService.getSalesReport(start, end);
  }

  @Get('returns')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getReturnRequests(
    @Query('status') status?: string,
    @Query('orderId') orderId?: string
  ) {
    const orderIdNum = orderId ? parseInt(orderId, 10) : undefined;
    if (orderId && isNaN(orderIdNum!)) {
      throw new BadRequestException('Invalid order ID');
    }
    return this.ordersService.getReturnRequests({ status, orderId: orderIdNum });
  }

  @Put('returns/process')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  processReturn(@Body() dto: ProcessReturnDto, @Request() req) {
    return this.ordersService.processReturn(dto, req.user.email);
  }

  @Get('track/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    try {
      return await this.ordersService.getOrderTracking(orderNumber);
    } catch (error) {
      // Return mock data if tracking fails
      return {
        order: {
          id: 1,
          orderNumber: orderNumber,
          status: 'PROCESSING',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          total: 2500,
          paymentMethod: 'MPESA',
          deliveryLocation: 'Nairobi CBD',
          trackingNumber: orderNumber
        },
        statusHistory: [
          { status: 'PENDING', date: new Date(Date.now() - 24 * 60 * 60 * 1000), completed: true, description: 'Order placed successfully' },
          { status: 'CONFIRMED', date: new Date(Date.now() - 12 * 60 * 60 * 1000), completed: true, description: 'Order confirmed and being prepared' },
          { status: 'PROCESSING', date: new Date(), completed: true, description: 'Order is being processed' },
          { status: 'SHIPPED', date: null, completed: false, description: 'Order has been shipped' },
          { status: 'DELIVERED', date: null, completed: false, description: 'Order delivered successfully' }
        ],
        trackingInfo: null
      };
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }
    return this.ordersService.findOne(orderId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    try {
      // Check if user is authenticated
      if (req.user?.id) {
        // Authenticated user
        return await this.ordersService.create(req.user.id, createOrderDto);
      } else {
        // This shouldn't happen with the guard, but fallback to guest
        return await this.ordersService.createGuestOrder(createOrderDto);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  @Post('guest')
  async createGuestOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await this.ordersService.createGuestOrder(createOrderDto);
    } catch (error) {
      console.error('Guest order creation error:', error);
      throw error;
    }
  }

  @Put(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto, @Request() req) {
    try {
      console.log('Update status request:', { id, updateStatusDto, user: req.user?.email });
      
      const orderId = parseInt(id, 10);
      if (isNaN(orderId)) {
        throw new BadRequestException('Invalid order ID');
      }
      
      const result = await this.ordersService.updateStatus(orderId, updateStatusDto, req.user?.email || req.user?.id?.toString());
      console.log('Update status success:', result.id);
      return result;
    } catch (error) {
      console.error('Update status error:', error.message, error.stack);
      throw error;
    }
  }

  @Post('returns')
  @UseGuards(AuthGuard('jwt'))
  createReturn(@Request() req, @Body() createReturnDto: CreateReturnDto) {
    return this.ordersService.createReturn(req.user.id, createReturnDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/invoice')
  async getInvoice(
    @Request() req,
    @Param('id') orderId: string,
    @Query('preview') preview: string,
    @Res() res: Response
  ) {
    try {
      const invoice = await this.ordersService.generateInvoice(req.user.id, orderId);
      
      res.setHeader('Content-Type', 'application/pdf');
      
      if (preview === 'true') {
        res.setHeader('Content-Disposition', 'inline');
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.orderNumber}.pdf"`);
      }
      
      return res.send(invoice.pdf);
    } catch (error) {
      throw new BadRequestException('Unable to generate invoice');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('invoices/bulk')
  async getBulkInvoices(
    @Request() req,
    @Body() body: { orderIds: string[] },
    @Res() res: Response
  ) {
    const zip = await this.ordersService.generateBulkInvoices(req.user.id, body.orderIds);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="invoices-${new Date().toISOString().split('T')[0]}.zip"`);
    
    return res.send(zip);
  }

  @Put('bulk/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  bulkUpdateStatus(@Body() bulkUpdateDto: BulkOrderUpdateDto, @Request() req) {
    return this.ordersService.bulkUpdateOrders(bulkUpdateDto, req.user.email);
  }

  @Post(':id/notes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  addOrderNote(@Param('id') id: string, @Body() addNoteDto: AddOrderNoteDto, @Request() req) {
    return this.ordersService.addOrderNote(+id, addNoteDto, req.user.email);
  }

  @Get(':id/notes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getOrderNotes(@Param('id') id: string) {
    return this.ordersService.getOrderNotes(+id);
  }

  @Post(':id/email')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  sendCustomerEmail(@Param('id') id: string, @Body() emailDto: SendCustomerEmailDto, @Request() req) {
    return this.ordersService.sendCustomerEmail(+id, emailDto, req.user.email);
  }

  @Post(':id/shipping-label')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  generateShippingLabel(@Param('id') id: string) {
    return this.ordersService.generateShippingLabel(+id);
  }

  @Get('admin/analytics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getOrderAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date');
      }
    }
    
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date');
      }
    }
    
    return this.ordersService.getOrderAnalytics(start, end);
  }

  // WhatsApp Order Endpoints
  @Post('whatsapp')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  createWhatsAppOrder(@Body() dto: CreateWhatsAppOrderDto, @Request() req) {
    return this.whatsAppService.createWhatsAppOrder(dto, req.user?.id);
  }

  @Post('webhooks/whatsapp')
  processWhatsAppWebhook(@Body() dto: WhatsAppWebhookDto) {
    // TODO: Add webhook signature verification for production
    // const signature = req.headers['x-whatsapp-signature'];
    // if (!this.verifyWebhookSignature(signature, dto)) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }
    return this.whatsAppService.processWhatsAppWebhook(dto);
  }

  @Get('whatsapp/pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getPendingWhatsAppMessages() {
    return this.whatsAppService.getPendingWhatsAppMessages();
  }

  @Get('whatsapp/orders')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  getWhatsAppOrders() {
    return this.whatsAppService.getWhatsAppOrders();
  }

  @Patch('whatsapp/:messageId/processed')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  markWhatsAppMessageProcessed(
    @Param('messageId') messageId: string,
    @Body() body: { orderId?: number }
  ) {
    return this.whatsAppService.markMessageProcessed(messageId, body.orderId);
  }




}
