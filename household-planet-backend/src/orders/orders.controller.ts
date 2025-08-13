import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderWithPaymentDto } from './dto/create-order-with-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ReturnRequestDto } from './dto/return-request.dto';
import { GuestCheckoutDto } from './dto/guest-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  createOrder(@CurrentUser('id') userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Post('with-payment')
  createOrderWithPayment(
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderWithPaymentDto
  ) {
    return this.ordersService.createOrderWithMpesaPayment(userId, createOrderDto);
  }

  @Post('from-cart')
  createOrderFromCart(
    @CurrentUser('id') userId: string,
    @Body() orderData: Omit<CreateOrderDto, 'items'>
  ) {
    return this.ordersService.createOrderFromCart(userId, orderData);
  }

  @Get()
  getOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.ordersService.getOrders(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
  }

  @Get(':orderId')
  getOrderById(@CurrentUser('id') userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(userId, orderId);
  }

  @Get(':orderId/tracking')
  getOrderTracking(@CurrentUser('id') userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.getOrderTracking(userId, orderId);
  }

  @Put(':orderId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateOrderStatus(@Param('orderId') orderId: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(orderId, updateStatusDto);
  }

  @Post(':orderId/return')
  createReturnRequest(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body() returnRequestDto: ReturnRequestDto
  ) {
    return this.ordersService.createReturnRequest(userId, orderId, returnRequestDto);
  }

  @Get('returns/my-requests')
  getReturnRequests(@CurrentUser('id') userId: string) {
    return this.ordersService.getReturnRequests(userId);
  }

  @Put('returns/:returnRequestId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateReturnRequestStatus(
    @Param('returnRequestId') returnRequestId: string,
    @Body() body: { status: string; notes?: string }
  ) {
    return this.ordersService.updateReturnRequestStatus(returnRequestId, body.status, body.notes);
  }

  @Post('guest-checkout')
  @Public()
  createGuestOrder(@Body() guestCheckoutDto: GuestCheckoutDto) {
    return this.ordersService.createGuestOrder(guestCheckoutDto);
  }

  @Get('guest/:orderNumber')
  @Public()
  getGuestOrder(
    @Param('orderNumber') orderNumber: string,
    @Query('email') email: string
  ) {
    return this.ordersService.getGuestOrderByNumber(orderNumber, email);
  }
}