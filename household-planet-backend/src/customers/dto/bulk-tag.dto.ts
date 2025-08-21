import { IsArray, IsString, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class BulkTagCustomersDto {
  @IsArray()
  @ArrayMinSize(1)
  customerIds: number[];

  @IsString()
  @IsNotEmpty()
  tag: string;
}