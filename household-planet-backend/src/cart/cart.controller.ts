import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';
import { SaveForLaterDto } from './dto/save-for-later.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post()
  addToCart(@CurrentUser('id') userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  getCart(@CurrentUser('id') userId: string, @Query('promoCode') promoCode?: string) {
    return this.cartService.getCartWithPromo(userId, promoCode);
  }

  @Put(':itemId')
  updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateCartDto: UpdateCartDto
  ) {
    return this.cartService.updateCartItem(userId, itemId, updateCartDto);
  }

  @Delete(':itemId')
  removeFromCart(@CurrentUser('id') userId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(userId, itemId);
  }

  @Delete()
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Post(':itemId/wishlist')
  moveToWishlist(@CurrentUser('id') userId: string, @Param('itemId') itemId: string) {
    return this.cartService.moveToWishlist(userId, itemId);
  }

  @Post('save-for-later')
  saveForLater(@CurrentUser('id') userId: string, @Body() saveForLaterDto: SaveForLaterDto) {
    return this.cartService.saveForLater(userId, saveForLaterDto);
  }

  @Get('saved-items')
  getSavedForLater(@CurrentUser('id') userId: string) {
    return this.cartService.getSavedForLater(userId);
  }

  @Post('saved-items/:savedItemId/move-to-cart')
  moveBackToCart(@CurrentUser('id') userId: string, @Param('savedItemId') savedItemId: string) {
    return this.cartService.moveBackToCart(userId, savedItemId);
  }

  @Delete('saved-items/:savedItemId')
  removeSavedItem(@CurrentUser('id') userId: string, @Param('savedItemId') savedItemId: string) {
    return this.cartService.removeSavedItem(userId, savedItemId);
  }

  @Post('apply-promo')
  applyPromoCode(@CurrentUser('id') userId: string, @Body() applyPromoDto: ApplyPromoDto) {
    return this.cartService.applyPromoCode(userId, applyPromoDto);
  }
}