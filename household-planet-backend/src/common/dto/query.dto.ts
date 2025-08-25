import { IsOptional, IsInt, Min, Max, IsString, MaxLength, IsIn } from 'class-validator';
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
  @IsIn(['createdAt', 'name', 'price', 'rating'])
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
  @Transform(({ value }) => value === 'true')
  featured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  active?: boolean = true;
}