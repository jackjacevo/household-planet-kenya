import { IsString, IsOptional, IsBoolean, IsInt, IsDecimal, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(200)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsString()
  @MaxLength(100)
  sku: string;

  @Transform(({ value }) => parseFloat(value))
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  price: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : null)
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : null)
  @IsDecimal({ decimal_digits: '3' })
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dimensions?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsString()
  imageAltTexts?: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  searchVector?: string;
}