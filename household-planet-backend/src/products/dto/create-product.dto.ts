import { IsString, IsOptional, IsBoolean, IsInt, IsDecimal, MaxLength, Min, MinLength, IsArray, IsUrl } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsValidSlug, IsPositiveNumber } from '../../common/validators/enhanced-validators';
import { IsSecureInput } from '../../common/validators/secure-input.validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters' })
  @MaxLength(200, { message: 'Product name cannot exceed 200 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @MaxLength(200)
  @IsValidSlug()
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  @IsSecureInput()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSecureInput()
  shortDescription?: string;

  @IsString()
  @MinLength(3, { message: 'SKU must be at least 3 characters' })
  @MaxLength(100)
  @Transform(({ value }) => value?.toUpperCase().trim())
  sku: string;

  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsOptional()
  @Transform(({ value }) => value ? (typeof value === 'string' ? parseFloat(value) : value) : null)
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @Transform(({ value }) => value ? (typeof value === 'string' ? parseFloat(value) : value) : null)
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  imageAltTexts?: string[];

  @Transform(({ value }) => typeof value === 'string' ? parseInt(value) : value)
  @IsInt({ message: 'Category ID must be a valid integer' })
  @Min(1, { message: 'Category ID must be greater than 0' })
  categoryId: number;

  @IsOptional()
  @Transform(({ value }) => value ? (typeof value === 'string' ? parseInt(value) : value) : null)
  @IsInt()
  @Min(1)
  brandId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value ? (typeof value === 'string' ? parseInt(value) : value) : 0)
  @IsInt()
  @Min(0)
  stock?: number = 0;

  @IsOptional()
  @Transform(({ value }) => value ? (typeof value === 'string' ? parseInt(value) : value) : 5)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number = 5;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  trackStock?: boolean = true;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @IsSecureInput()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSecureInput()
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}