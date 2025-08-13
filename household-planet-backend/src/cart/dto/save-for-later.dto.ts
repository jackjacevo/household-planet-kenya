import { IsString, IsNotEmpty } from 'class-validator';

export class SaveForLaterDto {
  @IsString()
  @IsNotEmpty()
  cartItemId: string;
}