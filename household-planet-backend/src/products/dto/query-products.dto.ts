import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto, SortDto } from '../../common/dto/pagination.dto';

export class QueryProductsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== 'false')
  active?: boolean = true;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  maxPrice?: number;
}
