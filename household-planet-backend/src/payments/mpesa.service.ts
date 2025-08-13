import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl = 'https://sandbox.safaricom.co.ke';
  private readonly businessShortCode = '247247';
  private readonly passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

  constructor(private prisma: PrismaService) {}

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', error);
      throw new BadRequestException('Payment service unavailable');
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    return Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
  }

  async initiateSTKPush(phoneNumber: string, amount: number, orderId: string) {
    const accessToken = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = this.generatePassword();

    const payload = {
      BusinessShortCode: this.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: this.businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BASE_URL}/api/payments/mpesa/callback`,
      AccountReference: '0740271041',
      TransactionDesc: 'Household Planet Kenya Payment'
    };

    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      await this.prisma.payment.create({
        data: {
          orderId,
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
          amount,
          phoneNumber,
          status: 'PENDING'
        }
      });

      return {
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription
      };
    } catch (error) {
      this.logger.error('STK Push failed', error);
      throw new BadRequestException('Payment initiation failed');
    }
  }

  async handleCallback(callbackData: any) {
    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData.Body.stkCallback;
    
    const payment = await this.prisma.payment.findFirst({
      where: { checkoutRequestId: CheckoutRequestID },
      include: { order: true }
    });

    if (!payment) return;

    if (ResultCode === 0) {
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber,
          transactionDate: transactionDate ? new Date(transactionDate.toString()) : new Date()
        }
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
      });

      this.logger.log(`Payment completed for order ${payment.orderId}`);
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: ResultDesc }
      });

      this.logger.warn(`Payment failed for order ${payment.orderId}: ${ResultDesc}`);
    }
  }

  async checkPaymentStatus(checkoutRequestId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { checkoutRequestId },
      include: { order: true }
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return {
      status: payment.status,
      amount: payment.amount,
      orderNumber: payment.order.orderNumber,
      mpesaReceiptNumber: payment.mpesaReceiptNumber
    };
  }
}