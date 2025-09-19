import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchFiltersDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  brandIds?: number[];

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  rating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  attributes?: any;

  @IsOptional()
  @IsIn(['name', 'price', 'createdAt', 'totalSales', 'averageRating'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @Transform(({ value }) => parseInt(value) || 1)
  @IsNumber()
  page: number = 1;

  @Transform(({ value }) => parseInt(value) || 20)
  @IsNumber()
  limit: number = 20;
}
