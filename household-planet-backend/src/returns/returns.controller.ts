import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/return.dto';

@Controller('returns')
@UseGuards(AuthGuard('jwt'))
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Get()
  getUserReturns(@Request() req) {
    return this.returnsService.getUserReturns(req.user.id);
  }

  @Post()
  createReturn(@Request() req, @Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.createReturn(req.user.id, createReturnDto);
  }

  @Get(':id')
  getReturn(@Request() req, @Param('id') returnId: string) {
    return this.returnsService.getReturn(req.user.id, returnId);
  }

  @Put(':id/cancel')
  cancelReturn(@Request() req, @Param('id') returnId: string) {
    return this.returnsService.cancelReturn(req.user.id, returnId);
  }
}