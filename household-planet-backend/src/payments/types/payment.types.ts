export interface PaymentResponse {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
}

export interface PaymentStatusResponse {
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: Date;
  amount?: number;
  phoneNumber?: string;
  resultDescription?: string;
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