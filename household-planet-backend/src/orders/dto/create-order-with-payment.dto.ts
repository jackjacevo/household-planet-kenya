import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class CreateOrderWithPaymentDto extends CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('KE')
  phoneNumber: string;
}