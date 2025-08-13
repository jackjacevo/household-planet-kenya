import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendPaymentConfirmationEmail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, payments: true }
    });

    if (!order) return;

    const payment = order.payments.find(p => p.status === 'COMPLETED');
    if (!payment) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: `Payment Confirmation - Order ${order.orderNumber}`,
      html: `
        <h2>Payment Confirmed</h2>
        <p>Dear ${order.user.name},</p>
        <p>Your payment of KES ${payment.amount} for order ${order.orderNumber} has been confirmed.</p>
        <p>Payment Method: ${payment.paymentMethod}</p>
        <p>Transaction ID: ${payment.mpesaReceiptNumber || payment.checkoutRequestId}</p>
        <p>Thank you for shopping with Household Planet Kenya!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { message: 'Email sending failed' };
    }
  }

  async sendPaymentConfirmationSMS(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, payments: true }
    });

    if (!order?.user.phone) return;

    const payment = order.payments.find(p => p.status === 'COMPLETED');
    if (!payment) return;

    const message = `Payment confirmed! KES ${payment.amount} for order ${order.orderNumber}. Thank you for shopping with Household Planet Kenya.`;

    try {
      // SMS API integration would go here
      await axios.post('https://api.africastalking.com/version1/messaging', {
        username: process.env.SMS_USERNAME,
        to: order.user.phone,
        message
      }, {
        headers: { 'apiKey': process.env.SMS_API_KEY }
      });

      return { message: 'SMS sent successfully' };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { message: 'SMS sending failed' };
    }
  }

  async sendPaymentFailureNotification(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: `Payment Failed - Order ${order.orderNumber}`,
      html: `
        <h2>Payment Failed</h2>
        <p>Dear ${order.user.name},</p>
        <p>Your payment for order ${order.orderNumber} could not be processed.</p>
        <p>Please try again or contact our support team.</p>
        <p><a href="${process.env.BASE_URL}/orders/${order.id}/retry">Retry Payment</a></p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}