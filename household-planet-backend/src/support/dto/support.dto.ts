import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  subject: string;

  @IsOptional()
  @IsEnum(['ORDER', 'PRODUCT', 'PAYMENT', 'DELIVERY', 'ACCOUNT', 'OTHER'])
  category?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: string;

  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  attachments?: string[];
}
