import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    try {
      // TODO: Implement Africa's Talking SMS integration
      // const africastalking = require('africastalking')({
      //   apiKey: this.configService.get('AFRICASTALKING_API_KEY'),
      //   username: this.configService.get('AFRICASTALKING_USERNAME'),
      // });

      // const result = await africastalking.SMS.send({
      //   to: [phone],
      //   message: `Your Household Planet Kenya verification code is: ${code}. Valid for 10 minutes.`,
      //   from: this.configService.get('AFRICASTALKING_SENDER_ID'),
      // });

      // For now, just log the code (development mode)
      this.logger.log(`SMS Verification Code for ${phone}: ${code}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}:`, error);
      return false;
    }
  }

  async sendPasswordResetCode(phone: string, code: string): Promise<boolean> {
    try {
      // TODO: Implement Africa's Talking SMS integration
      this.logger.log(`Password Reset Code for ${phone}: ${code}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset SMS to ${phone}:`, error);
      return false;
    }
  }
}