"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
let InvoiceService = class InvoiceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateInvoice(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: { include: { product: true } },
                payments: { where: { status: 'COMPLETED' } }
            }
        });
        if (!order)
            throw new Error('Order not found');
        const doc = new PDFDocument();
        const invoiceDir = path.join(__dirname, '../../invoices');
        if (!fs.existsSync(invoiceDir))
            fs.mkdirSync(invoiceDir, { recursive: true });
        const filename = `invoice-${order.orderNumber}.pdf`;
        const filepath = path.join(invoiceDir, filename);
        doc.pipe(fs.createWriteStream(filepath));
        doc.fontSize(20).text('INVOICE', 50, 50);
        doc.fontSize(12).text('Household Planet Kenya', 50, 80);
        doc.text(`Invoice #: ${order.orderNumber}`, 400, 50);
        doc.text(`Date: ${order.createdAt.toDateString()}`, 400, 70);
        doc.text('Bill To:', 50, 150);
        doc.text(order.user.name, 50, 170);
        doc.text(order.user.email, 50, 190);
        doc.text(order.shippingAddress, 50, 210);
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
        yPosition += 20;
        doc.text(`Subtotal: KES ${order.subtotal}`, 400, yPosition);
        doc.text(`Shipping: KES ${order.shippingCost}`, 400, yPosition + 20);
        doc.text(`Total: KES ${order.total}`, 400, yPosition + 40);
        const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
        doc.text(`Paid: KES ${paidAmount}`, 400, yPosition + 60);
        doc.text(`Balance: KES ${order.total - paidAmount}`, 400, yPosition + 80);
        doc.end();
        return filepath;
    }
    async emailInvoice(orderId, email) {
        const invoicePath = await this.generateInvoice(orderId);
        return { message: 'Invoice emailed', path: invoicePath };
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map