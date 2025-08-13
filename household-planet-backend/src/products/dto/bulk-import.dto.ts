import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class BulkProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsArray()
  variants?: {
    name: string;
    sku: string;
    price: number;
    stock: number;
    size?: string;
    color?: string;
    material?: string;
    lowStockThreshold?: number;
  }[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];
}