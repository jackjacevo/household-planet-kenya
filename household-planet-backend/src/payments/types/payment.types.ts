export interface PaymentResponse {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  amount?: number;
  originalAmount?: number | string;
  isPaymentId?: boolean;
}

export interface PaymentStatusResponse {
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: Date;
  amount?: number;
  originalAmount?: number | string;
  phoneNumber?: string;
  resultDescription?: string;
  isPaymentId?: boolean;
}

export interface PaymentStatsResponse {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  successRate: number;
}

export interface TransactionResponse {
  id: number;
  amount: number;
  status: string;
  provider: string;
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  createdAt: Date;
  order: {
    orderNumber: string;
    user?: {
      name: string;
      email: string;
    };
  };
}