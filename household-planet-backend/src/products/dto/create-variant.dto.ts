import { IsString, IsNumber, IsOptional, IsBoolean, IsJSON } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  stock: number;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number = 5;

  @IsOptional()
  @IsJSON()
  attributes?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsJSON()
  images?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  sortOrder?: number = 0;
}