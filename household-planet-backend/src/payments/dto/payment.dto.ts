import { IsString, IsNumber, IsOptional, IsEnum, Matches, Length, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum PaymentMethod {
  CARD = 'card',
  MPESA = 'mpesa',
}

// Custom validator to handle both numeric amounts and ID strings
function isNumericAmount(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function isPaymentId(value: any): boolean {
  return typeof value === 'string' && /^[A-Z]{2}-\d{13}-\d{4}$/.test(value);
}

export class CreatePaymentIntentDto {
  @ValidateIf((o) => isNumericAmount(o.amount))
  @IsNumber()
  @Transform(({ value }) => isNumericAmount(value) ? parseFloat(value) : value)
  @ValidateIf((o) => !isNumericAmount(o.amount))
  @IsString()
  @Matches(/^[A-Z]{2}-\d{13}-\d{4}$/, { message: 'Payment ID must be in format XX-XXXXXXXXXXXXX-XXXX (e.g., WA-1756163997824-4200)' })
  amount: number | string;

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

  @ValidateIf((o) => isNumericAmount(o.amount))
  @IsNumber()
  @Transform(({ value }) => isNumericAmount(value) ? parseFloat(value) : value)
  @ValidateIf((o) => !isNumericAmount(o.amount))
  @IsString()
  @Matches(/^[A-Z]{2}-\d{13}-\d{4}$/, { message: 'Payment ID must be in format XX-XXXXXXXXXXXXX-XXXX (e.g., WA-1756163997824-4200)' })
  amount: number | string;

  @IsString()
  accountReference: string;
}