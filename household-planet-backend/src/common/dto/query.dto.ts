import { IsOptional, IsInt, Min, Max, IsString, MaxLength, IsIn, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ProductQueryDto extends SearchDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  brand?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  inStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  onSale?: boolean;

  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  active?: boolean = true;
}
