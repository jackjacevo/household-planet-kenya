import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';

export enum DeliveryTimeSlot {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON', 
  EVENING = 'EVENING',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RESCHEDULED = 'RESCHEDULED',
}

export class ScheduleDeliveryDto {
  @IsString()
  orderId: string;

  @IsDateString()
  preferredDate: string;

  @IsEnum(DeliveryTimeSlot)
  timeSlot: DeliveryTimeSlot;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  photoProof?: string;

  @IsOptional()
  @IsString()
  failureReason?: string;
}

export class DeliveryFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
