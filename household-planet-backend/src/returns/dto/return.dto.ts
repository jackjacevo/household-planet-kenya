import { IsString, IsEnum, IsArray, ValidateNested, IsNumber, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
  @IsString()
  orderItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(1)
  reason: string;
}

export class CreateReturnDto {
  @IsString()
  orderId: string;

  @IsEnum(['RETURN', 'EXCHANGE'])
  type: string;

  @IsString()
  @MinLength(10)
  reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsString()
  preferredResolution?: string;
}
