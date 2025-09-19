import { IsArray, ArrayMinSize } from 'class-validator';

export class BulkDeleteCustomersDto {
  @IsArray()
  @ArrayMinSize(1)
  customerIds: number[];
}
