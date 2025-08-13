import { IsString, IsNotEmpty } from 'class-validator';

export class ApplyPromoDto {
  @IsString()
  @IsNotEmpty()
  promoCode: string;
}