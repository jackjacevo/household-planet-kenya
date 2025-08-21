import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  productId: number;

  @IsOptional()
  @IsInt()
  variantId?: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdateCartDto {
  @IsInt()
  @IsPositive()
  quantity: number;
}