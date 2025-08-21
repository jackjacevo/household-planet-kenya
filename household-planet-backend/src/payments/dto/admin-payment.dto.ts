import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { PaymentTransactionStatus } from '../../common/enums';
import { Type } from 'class-transformer';

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
  @IsNumber()
  @Min(0)
  amount?: number;
}