import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Get('summary')
  @UseGuards(AuthGuard('jwt'))
  getCartSummary(@Request() req) {
    return this.cartService.getCartSummary(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  updateCart(@Request() req, @Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.updateCart(req.user.id, +id, updateCartDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  removeFromCart(@Request() req, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.id, +id);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('save-for-later/:id')
  @UseGuards(AuthGuard('jwt'))
  saveForLater(@Request() req, @Param('id') id: string) {
    return this.cartService.saveForLater(req.user.id, +id);
  }

  @Post('validate')
  @UseGuards(AuthGuard('jwt'))
  validateCart(@Request() req) {
    return this.cartService.validateCartForCheckout(req.user.id);
  }
}