import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, IsNotEmpty, Min, ValidateIf, Matches } from 'class-validator';
import { PaymentTransactionStatus } from '../../common/enums';
import { Type, Transform } from 'class-transformer';

// Helper functions for payment ID validation
function isNumericAmount(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function isPaymentId(value: any): boolean {
  return typeof value === 'string' && /^[A-Z]{2}-\d{13}-\d{4}$/.test(value);
}

export class PaymentFilterDto {
  @IsOptional()
  @IsEnum(PaymentTransactionStatus)
  status?: PaymentTransactionStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;
}

export class RefundDto {
  @IsNotEmpty()
  @IsNumber()
  transactionId: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @ValidateIf((o) => o.amount !== undefined && isNumericAmount(o.amount))
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => isNumericAmount(value) ? parseFloat(value) : value)
  @ValidateIf((o) => o.amount !== undefined && !isNumericAmount(o.amount))
  @IsString()
  @Matches(/^[A-Z]{2}-\d{13}-\d{4}$/, { message: 'Payment ID must be in format XX-XXXXXXXXXXXXX-XXXX (e.g., WA-1756163997824-4200)' })
  amount?: number | string;
}