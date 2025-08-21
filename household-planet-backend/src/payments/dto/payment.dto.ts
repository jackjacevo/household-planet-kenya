import { IsString, IsNumber, IsOptional, IsEnum, Matches, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentMethod {
  CARD = 'card',
  MPESA = 'mpesa',
}

export class CreatePaymentIntentDto {
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  currency: string = 'KES';

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ProcessPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsString()
  paymentToken: string; // Tokenized payment data, never raw card details

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{3,4}$/)
  cvv?: string; // Only for verification, immediately discarded
}

export class MpesaPaymentDto {
  @IsString()
  @Matches(/^254[0-9]{9}$/)
  phoneNumber: string;

  @IsNumber()
  amount: number;

  @IsString()
  accountReference: string;
}