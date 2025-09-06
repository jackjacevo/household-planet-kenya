import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

interface STKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface MpesaCallbackData {
  Body: {
    stkCallback: {
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

interface C2BCallbackData {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: number;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber?: string;
  MSISDN: string;
  FirstName?: string;
  LastName?: string;
}

interface TransactionStatusResponse {
  ResponseCode: string;
  ResponseDescription: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly businessShortCode = '247247';
  private readonly accountNumber = '0740271041';
  private readonly passkey = process.env.MPESA_PASSKEY;
  private readonly consumerKey = process.env.MPESA_CONSUMER_KEY;
  private readonly consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  private readonly baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
  private accessTokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {
    if (!this.passkey || !this.consumerKey || !this.consumerSecret) {
      this.logger.error('M-Pesa credentials missing', {
        hasPasskey: !!this.passkey,
        hasConsumerKey: !!this.consumerKey,
        hasConsumerSecret: !!this.consumerSecret
      });
      throw new Error('M-Pesa credentials not configured');
    }
    this.logger.log('M-Pesa service initialized with Safaricom Daraja API');
  }

  private generateTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') +
           now.getHours().toString().padStart(2, '0') +
           now.getMinutes().toString().padStart(2, '0') +
           now.getSeconds().toString().padStart(2, '0');
  }

  private generatePassword(timestamp: string): string {
    const data = this.businessShortCode + this.passkey + timestamp;
    return Buffer.from(data).toString('base64');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessTokenCache && this.accessTokenCache.expiresAt > Date.now()) {
      return this.accessTokenCache.token;
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      this.logger.log('Requesting M-Pesa access token from Safaricom Daraja API');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data.access_token) {
        throw new Error('No access token in response');
      }

      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      
      this.accessTokenCache = {
        token,
        expiresAt: Date.now() + (expiresIn - 60) * 1000
      };

      this.logger.log('M-Pesa access token obtained successfully');
      return token;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  async initiateSTKPush(phoneNumber: string, amount: number, orderId: number): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Validate and format phone number
      const formattedPhone = this.validateAndFormatPhoneNumber(phoneNumber);

      const stkPushData: STKPushRequest = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.APP_URL || 'http://localhost:3001'}/api/payments/mpesa/callback`,
        AccountReference: 'HouseholdPlanet',
        TransactionDesc: 'Household Planet Kenya Payment',
      };

      this.logger.log('Sending STK Push request to Safaricom Daraja API', {
        businessShortCode: this.businessShortCode,
        amount,
        phoneNumber: formattedPhone
      });

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        stkPushData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000
        }
      );

      const stkResponse: STKPushResponse = response.data;

      // Store payment request in database
      await this.prisma.paymentTransaction.create({
        data: {
          orderId,
          merchantRequestId: stkResponse.MerchantRequestID,
          checkoutRequestId: stkResponse.CheckoutRequestID,
          phoneNumber: formattedPhone,
          amount,
          status: 'PENDING',
          provider: 'MPESA',
          paymentType: 'STK_PUSH',
        },
      });

      this.logger.log(`STK Push initiated successfully for order ${orderId}`, {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID
      });

      return {
        success: true,
        message: stkResponse.CustomerMessage,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
      };
    } catch (error) {
      this.logger.error('STK Push failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        orderId,
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{6})(\d{3})/, '$1***$3')
      });
      
      if (error.response?.status === 401) {
        this.accessTokenCache = null; // Clear cached token
        throw new BadRequestException('Authentication failed. Please try again.');
      }
      
      throw new BadRequestException('Failed to initiate payment. Please try again.');
    }
  }

  async handleCallback(callbackData: MpesaCallbackData): Promise<void> {
    try {
      if (!callbackData?.Body?.stkCallback) {
        throw new Error('Invalid callback data structure');
      }
      
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;

      let mpesaReceiptNumber = null;
      let transactionDate = null;
      let phoneNumber = null;
      let amount = null;

      if (resultCode === 0 && stkCallback.CallbackMetadata) {
        const metadata = stkCallback.CallbackMetadata.Item;
        
        for (const item of metadata) {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              mpesaReceiptNumber = item.Value;
              break;
            case 'TransactionDate':
              transactionDate = new Date(item.Value.toString());
              break;
            case 'PhoneNumber':
              phoneNumber = item.Value;
              break;
            case 'Amount':
              amount = item.Value;
              break;
          }
        }
      }

      // Update payment transaction with retry logic
      const transaction = await this.updateTransactionWithRetry(checkoutRequestId, {
        status: resultCode === 0 ? 'COMPLETED' : 'FAILED',
        mpesaReceiptNumber,
        transactionDate,
        resultCode: resultCode.toString(),
        resultDescription: resultDesc,
      });

      // Send SMS receipt for successful payments
      if (resultCode === 0 && mpesaReceiptNumber && transaction) {
        await this.smsService.sendPaymentReceipt(
          phoneNumber || transaction.phoneNumber,
          Number(amount || transaction.amount),
          mpesaReceiptNumber,
          transaction.order?.orderNumber || 'N/A'
        );
      }

      this.logger.log(`Payment ${resultCode === 0 ? 'completed' : 'failed'}: ${checkoutRequestId}`);
    } catch (error) {
      this.logger.error('Failed to process M-Pesa callback', error);
      // Log error without retry to prevent infinite loops
      this.logger.error('Failed to process M-Pesa callback - manual intervention required', error);
    }
  }

  private async updateTransactionWithRetry(checkoutRequestId: string, data: any, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const paymentTransaction = await tx.paymentTransaction.update({
            where: { checkoutRequestId },
            data,
            include: { order: true },
          });

          if (data.status === 'COMPLETED') {
            await tx.order.update({
              where: { id: paymentTransaction.orderId },
              data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
            });
          }

          return paymentTransaction;
        });
      } catch (error) {
        this.logger.warn(`Transaction update attempt ${i + 1} failed: ${error.message}`);
        if (i === retries - 1) throw error;
        await this.delay(1000 * (i + 1));
      }
    }
  }

  async checkTransactionStatus(checkoutRequestId: string): Promise<TransactionStatusResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const queryData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        queryData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to check transaction status', error);
      throw new BadRequestException('Failed to check payment status');
    }
  }

  async retryPayment(orderId: number): Promise<any> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (order.paymentStatus === 'PAID') {
        throw new BadRequestException('Order is already paid');
      }

      if (!order.user.phone) {
        throw new BadRequestException('Phone number not found for user');
      }

      const amount = parseFloat(order.total.toString());
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException('Invalid order amount');
      }

      return this.initiateSTKPush(order.user.phone, amount, orderId);
    } catch (error) {
      this.logger.error('Failed to retry payment', error);
      throw error;
    }
  }

  async handleC2BCallback(callbackData: C2BCallbackData): Promise<void> {
    try {
      const { TransactionType, TransID, TransTime, TransAmount, BusinessShortCode, BillRefNumber, InvoiceNumber, MSISDN, FirstName, LastName } = callbackData;
      
      // Save C2B transaction
      await this.prisma.paymentTransaction.create({
        data: {
          orderId: null, // C2B payments might not have orders initially
          checkoutRequestId: TransID,
          phoneNumber: MSISDN,
          amount: TransAmount,
          status: 'COMPLETED',
          provider: 'MPESA',
          paymentType: 'PAYBILL',
          mpesaReceiptNumber: TransID,
          paybillReference: BillRefNumber || 'HouseholdPlanet',
          transactionDate: new Date(TransTime),
          resultCode: '0',
          resultDescription: `C2B Payment - ${TransactionType}`,
        },
      });

      this.logger.log(`C2B Payment received: ${TransID} - Amount: ${TransAmount} from ${MSISDN}`);
    } catch (error) {
      this.logger.error('Failed to process C2B callback', error);
    }
  }

  async registerC2BUrls(): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const registerData = {
        ShortCode: this.businessShortCode,
        ResponseType: 'Completed',
        ConfirmationURL: `${process.env.APP_URL || 'http://localhost:3001'}/api/payments/mpesa/c2b/confirmation`,
        ValidationURL: `${process.env.APP_URL || 'http://localhost:3001'}/api/payments/mpesa/c2b/validation`,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/c2b/v1/registerurl`,
        registerData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log('C2B URLs registered successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to register C2B URLs', error);
      throw error;
    }
  }

  private validateAndFormatPhoneNumber(phoneNumber: string): string {
    // Remove spaces and special characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Remove + prefix
    let formatted = cleaned.replace(/^\+/, '');
    
    // Convert different formats to 254xxxxxxxxx
    if (formatted.startsWith('07')) {
      formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('7') && formatted.length === 9) {
      formatted = '254' + formatted;
    } else if (!formatted.startsWith('254')) {
      throw new BadRequestException('Invalid phone number format');
    }
    
    // Validate final format
    if (!/^254\d{9}$/.test(formatted)) {
      throw new BadRequestException('Invalid Kenyan mobile number format');
    }
    
    return formatted;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}