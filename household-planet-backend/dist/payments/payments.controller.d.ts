import { MpesaService } from './mpesa.service';
import { StripeService } from './stripe.service';
import { FlutterwaveService } from './flutterwave.service';
import { PaymentManagementService } from './payment-management.service';
import { PaymentRetryService } from './payment-retry.service';
import { PartialPaymentService } from './partial-payment.service';
import { PaymentAnalyticsService } from './payment-analytics.service';
import { InvoiceService } from './invoice.service';
import { NotificationService } from './notification.service';
import { PaymentSecurityService } from './payment-security.service';
export declare class PaymentsController {
    private mpesaService;
    private stripeService;
    private flutterwaveService;
    private paymentManagementService;
    private paymentRetryService;
    private partialPaymentService;
    private paymentAnalyticsService;
    private invoiceService;
    private notificationService;
    private paymentSecurityService;
    constructor(mpesaService: MpesaService, stripeService: StripeService, flutterwaveService: FlutterwaveService, paymentManagementService: PaymentManagementService, paymentRetryService: PaymentRetryService, partialPaymentService: PartialPaymentService, paymentAnalyticsService: PaymentAnalyticsService, invoiceService: InvoiceService, notificationService: NotificationService, paymentSecurityService: PaymentSecurityService);
    initiatePayment(body: {
        phoneNumber: string;
        amount: number;
        orderId: string;
    }, user: any): Promise<{
        checkoutRequestId: any;
        responseCode: any;
        responseDescription: any;
    }>;
    mpesaCallback(callbackData: any): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    getPaymentStatus(checkoutRequestId: string): Promise<{
        status: string;
        amount: number;
        orderNumber: string;
        mpesaReceiptNumber: string;
    }>;
    createStripePayment(body: {
        amount: number;
        orderId: string;
    }): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    confirmStripePayment(body: {
        paymentIntentId: string;
    }): Promise<{
        status: import("stripe").Stripe.PaymentIntent.Status;
    }>;
    initiateFlutterwavePayment(body: {
        amount: number;
        email: string;
        phoneNumber: string;
        orderId: string;
    }): Promise<{
        paymentLink: any;
        txRef: string;
    }>;
    verifyFlutterwavePayment(body: {
        txRef: string;
    }): Promise<{
        status: any;
    }>;
    processCOD(orderId: string): Promise<{
        message: string;
    }>;
    confirmCOD(orderId: string): Promise<{
        message: string;
    }>;
    processBankTransfer(orderId: string, bankDetails: any): Promise<{
        message: string;
        bankDetails: {
            accountName: string;
            accountNumber: string;
            bank: string;
            branch: string;
        };
    }>;
    verifyBankTransfer(orderId: string, body: {
        referenceNumber: string;
    }): Promise<{
        message: string;
    }>;
    processRefund(body: {
        paymentId: string;
        amount: number;
        reason: string;
    }): Promise<{
        message: string;
    }>;
    getPaymentDashboard(): Promise<{
        summary: {
            totalPayments: number;
            pendingPayments: number;
            completedPayments: number;
            refunds: number;
        };
        paymentsByMethod: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "paymentMethod"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                amount: number;
            };
        })[];
    }>;
    getTransactionHistory(query: {
        page?: number;
        limit?: number;
    }): Promise<{
        payments: ({
            order: {
                userId: string;
                orderNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phoneNumber: string;
            status: string;
            orderId: string;
            failureReason: string | null;
            paymentMethod: string;
            checkoutRequestId: string;
            merchantRequestId: string | null;
            amount: number;
            mpesaReceiptNumber: string | null;
            transactionDate: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    retryPayment(paymentId: string): Promise<{
        message: string;
        result?: undefined;
    } | {
        message: string;
        result: any;
    }>;
    createPartialPaymentPlan(orderId: string, body: {
        installments: number;
    }): Promise<{
        message: string;
        installments: number;
    }>;
    payInstallment(installmentId: string, paymentData: any): Promise<{
        message: string;
    }>;
    getPaymentAnalytics(query: {
        startDate: string;
        endDate: string;
    }): Promise<{
        summary: {
            totalRevenue: number;
            totalTransactions: number;
            avgTransactionValue: number;
            failureRate: number;
        };
        paymentsByMethod: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "paymentMethod"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                amount: number;
            };
        })[];
        dailyRevenue: unknown;
        period: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    generateInvoice(orderId: string): Promise<{
        message: string;
        path: string;
    }>;
    sendPaymentNotification(orderId: string): Promise<{
        message: string;
    }>;
    createSecureSession(body: {
        orderId: string;
        paymentMethod: string;
    }): Promise<{
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        expiresAt: Date;
    }>;
}
