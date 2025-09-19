import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BaseQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class IdParamDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  id: number;
}

export class BulkActionDto {
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  ids: number[];
}
