import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidatePromoCodeDto } from './dto/promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() createPromoCodeDto: CreatePromoCodeDto, @Request() req) {
    return this.promoCodesService.create(createPromoCodeDto, req.user?.name || req.user?.email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.promoCodesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.promoCodesService.findOne(+id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getAnalytics(@Param('id') id: string) {
    return this.promoCodesService.getAnalytics(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updatePromoCodeDto: UpdatePromoCodeDto) {
    return this.promoCodesService.update(+id, updatePromoCodeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  remove(@Param('id') id: string) {
    return this.promoCodesService.remove(+id);
  }

  @Post('validate')
  validate(@Body() validatePromoCodeDto: ValidatePromoCodeDto, @Request() req) {
    const userId = req.user?.id || null;
    return this.promoCodesService.validatePromoCode(validatePromoCodeDto, userId);
  }
}
