import { Controller, Post, Body } from '@nestjs/common';
import { GuestCartService } from './guest-cart.service';
import { Public } from '../auth/decorators/public.decorator';

interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

@Controller('guest-cart')
@Public()
export class GuestCartController {
  constructor(private guestCartService: GuestCartService) {}

  @Post('validate')
  validateGuestCart(@Body() body: { items: GuestCartItem[] }) {
    return this.guestCartService.validateGuestCart(body.items);
  }
}