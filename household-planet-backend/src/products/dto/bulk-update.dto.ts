import { IsArray, IsOptional, IsBoolean, IsDecimal, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BulkUpdateFields {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsDecimal()
  price?: number;

  @IsOptional()
  @IsInt()
  categoryId?: number;
}

export class BulkUpdateDto {
  @IsArray()
  @IsInt({ each: true })
  productIds: number[];

  @ValidateNested()
  @Type(() => BulkUpdateFields)
  updates: BulkUpdateFields;
}
