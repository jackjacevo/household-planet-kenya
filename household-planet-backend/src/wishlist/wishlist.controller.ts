import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  @UseGuards(AuthGuard('jwt'))
  addToWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(req.user.id, +productId);
  }

  @Delete(':productId')
  @UseGuards(AuthGuard('jwt'))
  removeFromWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, +productId);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  clearWishlist(@Request() req) {
    return this.wishlistService.clearWishlist(req.user.id);
  }

  @Post('move-to-cart/:productId')
  @UseGuards(AuthGuard('jwt'))
  moveToCart(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.moveToCart(req.user.id, +productId);
  }
}