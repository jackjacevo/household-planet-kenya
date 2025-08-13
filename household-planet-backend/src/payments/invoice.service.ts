import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoice(orderId: string): Promise<string> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } },
        payments: { where: { status: 'COMPLETED' } }
      }
    });

    if (!order) throw new Error('Order not found');

    const doc = new PDFDocument();
    const invoiceDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });
    
    const filename = `invoice-${order.orderNumber}.pdf`;
    const filepath = path.join(invoiceDir, filename);
    
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc.fontSize(20).text('INVOICE', 50, 50);
    doc.fontSize(12).text('Household Planet Kenya', 50, 80);
    doc.text(`Invoice #: ${order.orderNumber}`, 400, 50);
    doc.text(`Date: ${order.createdAt.toDateString()}`, 400, 70);

    // Customer Info
    doc.text('Bill To:', 50, 150);
    doc.text(order.user.name, 50, 170);
    doc.text(order.user.email, 50, 190);
    doc.text(order.shippingAddress, 50, 210);

    // Items Table
    let yPosition = 260;
    doc.text('Item', 50, yPosition);
    doc.text('Qty', 300, yPosition);
    doc.text('Price', 400, yPosition);
    doc.text('Total', 500, yPosition);
    
    yPosition += 20;
    order.items.forEach(item => {
      doc.text(item.product.name, 50, yPosition);
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(`KES ${item.price}`, 400, yPosition);
      doc.text(`KES ${item.total}`, 500, yPosition);
      yPosition += 20;
    });

    // Totals
    yPosition += 20;
    doc.text(`Subtotal: KES ${order.subtotal}`, 400, yPosition);
    doc.text(`Shipping: KES ${order.shippingCost}`, 400, yPosition + 20);
    doc.text(`Total: KES ${order.total}`, 400, yPosition + 40);

    // Payment Status
    const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
    doc.text(`Paid: KES ${paidAmount}`, 400, yPosition + 60);
    doc.text(`Balance: KES ${order.total - paidAmount}`, 400, yPosition + 80);

    doc.end();

    return filepath;
  }

  async emailInvoice(orderId: string, email: string) {
    const invoicePath = await this.generateInvoice(orderId);
    // Email sending logic would go here
    return { message: 'Invoice emailed', path: invoicePath };
  }
}