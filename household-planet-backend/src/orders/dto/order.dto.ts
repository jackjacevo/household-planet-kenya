import { IsEnum, IsInt, IsString, IsOptional, IsArray, ValidateNested, IsDecimal, IsBoolean, IsDateString, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentMethod } from '../../common/enums';

export class CreateOrderItemDto {
  @IsInt()
  productId: number;

  @IsOptional()
  @IsInt()
  variantId?: number;

  @IsInt()
  quantity: number;

  @IsDecimal()
  price: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];



  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @IsOptional()
  @IsString()
  deliveryLocationId?: string;

  @IsOptional()
  @IsDecimal()
  deliveryPrice?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReturnDto {
  @IsInt()
  orderId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  preferredResolution?: string;
}

export class ReturnItemDto {
  @IsInt()
  orderItemId: number;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ProcessReturnDto {
  @IsString()
  @IsNotEmpty()
  returnId: string;

  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDecimal()
  refundAmount?: number;
}

export class BulkOrderUpdateDto {
  @IsArray()
  @IsInt({ each: true })
  orderIds: number[];

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderFilterDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  returnable?: boolean;
}

export class AddOrderNoteDto {
  @IsString()
  @IsNotEmpty()
  note: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = true;
}

export class SendCustomerEmailDto {
  @IsString()
  @IsNotEmpty()
  template: 'order_confirmation' | 'shipping_notification' | 'delivery_confirmation' | 'custom';

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class CreateWhatsAppOrderDto {
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  orderDetails: string;

  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @IsNumber()
  deliveryCost: number;

  @IsOptional()
  @IsNumber()
  estimatedTotal?: number;

  @IsString()
  @IsNotEmpty()
  paymentMode: string;

  @IsString()
  @IsNotEmpty()
  deliveryType: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class WhatsAppWebhookDto {
  @IsString()
  from: string;

  @IsString()
  body: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  messageId?: string;
}