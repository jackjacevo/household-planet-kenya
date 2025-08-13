import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class FlutterwaveService {
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  constructor(private prisma: PrismaService) {}

  async initiatePayment(amount: number, email: string, phoneNumber: string, orderId: string) {
    try {
      const payload = {
        tx_ref: `HHP-${orderId}-${Date.now()}`,
        amount,
        currency: 'KES',
        redirect_url: `${process.env.BASE_URL}/payment/callback`,
        customer: { email, phonenumber: phoneNumber },
        customizations: {
          title: 'Household Planet Kenya',
          description: 'Payment for order'
        }
      };

      const response = await axios.post(`${this.baseUrl}/payments`, payload, {
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
      });

      await this.prisma.payment.create({
        data: {
          orderId,
          checkoutRequestId: payload.tx_ref,
          amount,
          phoneNumber,
          status: 'PENDING',
          paymentMethod: 'FLUTTERWAVE'
        }
      });

      return {
        paymentLink: response.data.data.link,
        txRef: payload.tx_ref
      };
    } catch (error) {
      throw new BadRequestException('Failed to initiate Flutterwave payment');
    }
  }

  async verifyPayment(txRef: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${txRef}`, {
        headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
      });

      const payment = await this.prisma.payment.findFirst({
        where: { checkoutRequestId: txRef }
      });

      if (payment && response.data.data.status === 'successful') {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', mpesaReceiptNumber: response.data.data.flw_ref }
        });

        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
        });
      }

      return { status: response.data.data.status };
    } catch (error) {
      throw new BadRequestException('Payment verification failed');
    }
  }
}