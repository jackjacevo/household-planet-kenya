import { IsString, IsOptional, IsEnum, IsObject, IsNumber } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsNumber()
  loyaltyPoints?: number;

  @IsOptional()
  @IsNumber()
  totalSpent?: number;

  @IsOptional()
  @IsNumber()
  totalOrders?: number;

  @IsOptional()
  @IsNumber()
  averageOrderValue?: number;

  @IsOptional()
  @IsString()
  preferredCategories?: string;

  @IsOptional()
  @IsObject()
  communicationPreferences?: any;
}

export class CreateCustomerTagDto {
  @IsString()
  tag: string;
}

export class CustomerCommunicationDto {
  @IsEnum(['EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'IN_APP', 'PHONE_CALL'])
  type: 'EMAIL' | 'SMS' | 'PUSH_NOTIFICATION' | 'IN_APP' | 'PHONE_CALL';

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;

  @IsString()
  channel: string;

  @IsOptional()
  @IsString()
  sentBy?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
