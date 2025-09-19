import { 
  Controller, 
  Get, 
  Put, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  Req,
  ValidationPipe,
  UsePipes,
  Param
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';
import { 
  UpdateSettingsDto, 
  UpdateSettingDto,
  CompanySettingsDto,
  PaymentSettingsDto,
  NotificationSettingsDto,
  InventorySettingsDto,
  SEOSettingsDto,
  SecuritySettingsDto,
  EmailSettingsDto,
  SocialMediaSettingsDto,
  DeliverySettingsDto,
  SettingType
} from './dto/settings.dto';

@Controller('admin/settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getAllSettings(@Query('category') category?: string) {
    return this.settingsService.getAllSettings(category);
  }

  @Get('public')
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get(':category/:key')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getSetting(
    @Param('category') category: string,
    @Param('key') key: string
  ) {
    return this.settingsService.getSetting(category, key);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSettings(@Body() updateDto: UpdateSettingsDto, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return this.settingsService.updateSettings(
      updateDto,
      req.user?.id,
      ipAddress,
      userAgent
    );
  }

  @Put('single')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSetting(@Body() updateDto: UpdateSettingDto, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return this.settingsService.updateSetting(
      updateDto,
      req.user?.id,
      ipAddress,
      userAgent
    );
  }

  // Category-specific endpoints for easier frontend integration
  @Put('company')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateCompanySettings(@Body() companyDto: CompanySettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('company', companyDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updatePaymentSettings(@Body() paymentDto: PaymentSettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('payment', paymentDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('notification')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateNotificationSettings(@Body() notificationDto: NotificationSettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('notification', notificationDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('inventory')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateInventorySettings(@Body() inventoryDto: InventorySettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('inventory', inventoryDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('seo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSEOSettings(@Body() seoDto: SEOSettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('seo', seoDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('security')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSecuritySettings(@Body() securityDto: SecuritySettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('security', securityDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('email')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateEmailSettings(@Body() emailDto: EmailSettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('email', emailDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('social')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSocialMediaSettings(@Body() socialDto: SocialMediaSettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('social', socialDto);
    return this.updateSettings({ settings }, req);
  }

  @Put('delivery')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateDeliverySettings(@Body() deliveryDto: DeliverySettingsDto, @Req() req) {
    const settings = this.transformToUpdateDto('delivery', deliveryDto);
    return this.updateSettings({ settings }, req);
  }

  @Post('reset')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async resetToDefaults(
    @Query('category') category?: string,
    @Req() req?
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return this.settingsService.resetToDefaults(
      category,
      req.user?.id,
      ipAddress,
      userAgent
    );
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async exportSettings(@Query('category') category?: string) {
    return this.settingsService.exportSettings(category);
  }

  @Post('import')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async importSettings(@Body() settingsData: any, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    return this.settingsService.importSettings(
      settingsData,
      req.user?.id,
      ipAddress,
      userAgent
    );
  }

  private transformToUpdateDto(category: string, dto: any): UpdateSettingDto[] {
    const settings: UpdateSettingDto[] = [];
    
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== null) {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        
        settings.push({
          category,
          key: snakeKey,
          value: String(value),
          type: this.inferType(value),
        });
      }
    }
    
    return settings;
  }

  private inferType(value: any): SettingType {
    if (typeof value === 'boolean') return SettingType.BOOLEAN;
    if (typeof value === 'number') return SettingType.NUMBER;
    if (Array.isArray(value) || typeof value === 'object') return SettingType.JSON;
    if (typeof value === 'string') {
      // Check if it's an email
      if (value.includes('@') && value.includes('.')) return SettingType.EMAIL;
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) return SettingType.URL;
      // Check if it's a color
      if (value.startsWith('#') && value.length === 7) return SettingType.COLOR;
    }
    return SettingType.STRING;
  }
}
