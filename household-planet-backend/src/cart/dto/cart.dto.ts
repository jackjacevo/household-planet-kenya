import { IsInt, IsPositive, IsOptional, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AddToCartDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Product ID must be a valid integer' })
  @Min(1, { message: 'Product ID must be greater than 0' })
  productId: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : null)
  @IsInt({ message: 'Variant ID must be a valid integer' })
  @Min(1, { message: 'Variant ID must be greater than 0' })
  variantId?: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Quantity must be a valid integer' })
  @IsPositive({ message: 'Quantity must be positive' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(99, { message: 'Quantity cannot exceed 99' })
  quantity: number;
}

export class UpdateCartDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Quantity must be a valid integer' })
  @IsPositive({ message: 'Quantity must be positive' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(99, { message: 'Quantity cannot exceed 99' })
  quantity: number;
}

export class RemoveFromCartDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Product ID must be a valid integer' })
  @Min(1, { message: 'Product ID must be greater than 0' })
  productId: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : null)
  @IsInt({ message: 'Variant ID must be a valid integer' })
  @Min(1, { message: 'Variant ID must be greater than 0' })
  variantId?: number;
}