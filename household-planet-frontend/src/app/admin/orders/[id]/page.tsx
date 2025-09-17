'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  Mail, 
  Phone, 
  Send,
  Plus,
  FileText
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
  </svg>
);

interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  priority: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  deliveryLocation?: string;
  deliveryPrice?: number;
  source?: string;
  tags?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  } | null;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: number;
      name: string;
      images: string;
      sku: string;
    };
    variant?: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
  notes: Array<{
    id: number;
    note: string;
    isInternal: boolean;
    createdAt: string;
    createdBy?: string;
  }>;
  statusHistory: Array<{
    id: number;
    status: string;
    notes?: string;
    createdAt: string;
    changedBy?: string;
  }>;
  communications: Array<{
    id: number;
    type: string;
    template?: string;
    subject?: string;
    message: string;
    sentAt: string;
    sentBy?: string;
  }>;
  paymentTransactions?: Array<{
    id: number;
    checkoutRequestId: string;
    status: string;
    amount: number;
    mpesaReceiptNumber?: string;
    createdAt: string;
  }>;
  delivery?: {
    id: number;
    trackingNumber: string;
    status: string;
    scheduledDate?: string;
    notes?: string;
  };
  returnRequests?: Array<{
    id: string;
    returnNumber: string;
    status: string;
    reason: string;
    createdAt: string;
  }>;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    if (params.id && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
      fetchOrderDetails();
    }
  }, [params.id, user]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string, notes?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const addOrderNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          note: newNote,
          isInternal: isInternalNote
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNewNote('');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const sendCustomerEmail = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          template: emailTemplate,
          subject: customSubject,
          customMessage: customMessage
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setShowEmailDialog(false);
      setEmailTemplate('');
      setCustomSubject('');
      setCustomMessage('');
      fetchOrderDetails();
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const generateShippingLabel = async () => {
    setShippingLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/shipping-label`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      alert(`Shipping label generated successfully! Tracking: ${data.trackingNumber}`);
      fetchOrderDetails();
    } catch (error) {
      console.error('Error generating shipping label:', error);
      alert(`Failed to generate shipping label: ${error.message}`);
    } finally {
      setShippingLoading(false);
    }
  };

  const viewReceipt = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/receipt/${params.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to generate receipt');
      }
      
      const receiptData = await response.json();
      await generatePDFReceipt(receiptData);
    } catch (error) {
      console.error('Error viewing receipt:', error);
      alert(error.message || 'Failed to load receipt. Please try again.');
    }
  };

  const generatePDFReceipt = async (receipt: any) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      
      // Get customer info from order data - check all possible sources
      const customerName = receipt.customer?.name || 
                          receipt.customerName || 
                          receipt.user?.name || 
                          receipt.shippingAddress?.fullName || 
                          'Valued Customer';
      
      const customerPhone = receipt.customer?.phone || 
                           receipt.customerPhone || 
                           receipt.user?.phone || 
                           receipt.shippingAddress?.phone || 
                           (receipt.source === 'ADMIN' || receipt.createdBy === 'admin' ? '+254790227760' : null) ||
                           'Not provided';
      
      const deliveryLocation = receipt.deliveryLocation || 'Not specified';
      
      const orderDate = receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
      
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; color: black; font-size: 12px; line-height: 1.4;">
          <!-- Header -->
          <div style="text-center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #16a34a;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #16a34a; margin-bottom: 8px;">HOUSEHOLD PLANET KENYA</h1>
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 8px;">Your Premier Home & Living Store</p>
            <div style="font-size: 12px; color: #888;">
              📞 +254790 227 760 • 📧 householdplanet819@gmail.com
            </div>
          </div>

          <!-- Order & Customer Info -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1e40af;">ORDER DETAILS</h3>
              <div style="font-size: 12px;">
                <p style="margin: 5px 0;"><span style="color: #666;">Receipt #:</span> <strong>${receipt.receiptNumber || receipt.orderNumber}</strong></p>
                <p style="margin: 5px 0;"><span style="color: #666;">Date:</span> ${orderDate}</p>
                <p style="margin: 5px 0;"><span style="color: #666;">Status:</span> ${receipt.status || 'CONFIRMED'}</p>
              </div>
            </div>
            
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #16a34a;">CUSTOMER INFO</h3>
              <div style="font-size: 12px;">
                <p style="margin: 5px 0;"><span style="color: #666;">Name:</span> ${customerName}</p>
                <p style="margin: 5px 0;"><span style="color: #666;">Phone:</span> ${customerPhone}</p>
                <p style="margin: 5px 0;"><span style="color: #666;">Location:</span> ${deliveryLocation}</p>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #374151; background: #f3f4f6; padding: 8px; border-radius: 5px;">ORDER ITEMS (${receipt.items?.length || 0})</h3>
            
            <div style="border: 1px solid #d1d5db; border-radius: 5px; overflow: hidden;">
              <div style="background: #f9fafb; border-bottom: 1px solid #d1d5db; padding: 8px;">
                <div style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr; gap: 10px; font-weight: bold; font-size: 11px; color: #374151;">
                  <div>PRODUCT</div>
                  <div style="text-align: center;">QTY</div>
                  <div style="text-align: right;">PRICE</div>
                  <div style="text-align: right;">TOTAL</div>
                </div>
              </div>
              
              ${receipt.items?.map((item: any, index: number) => `
                <div style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr; gap: 10px; padding: 8px; font-size: 11px; ${index % 2 === 0 ? 'background: white;' : 'background: #f9fafb;'} border-bottom: 1px solid #e5e7eb;">
                  <div>
                    <div style="font-weight: bold; color: #374151; margin-bottom: 2px;">${item.name}</div>
                    ${item.variant ? `<div style="color: #6b7280; font-size: 10px;">${item.variant.name || ''}</div>` : ''}
                  </div>
                  <div style="text-align: center; font-weight: bold;">${item.quantity}</div>
                  <div style="text-align: right;">KSh ${item.price?.toLocaleString() || '0'}</div>
                  <div style="text-align: right; font-weight: bold;">KSh ${item.total?.toLocaleString() || '0'}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Totals -->
          <div style="background: #f9fafb; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <div style="font-size: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal (${receipt.items?.length || 0} items):</span>
                <span style="font-weight: bold;">KSh ${receipt.totals?.subtotal?.toLocaleString() || '0'}</span>
              </div>
              ${receipt.totals?.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a;">
                  <span>Discount${receipt.promoCode ? ` (${receipt.promoCode})` : ''}:</span>
                  <span style="font-weight: bold;">-KSh ${receipt.totals.discount.toLocaleString()}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Delivery Fee:</span>
                <span style="font-weight: bold;">KSh ${receipt.totals?.shipping?.toLocaleString() || '0'}</span>
              </div>
              <div style="border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
                  <span>TOTAL AMOUNT:</span>
                  <span style="color: #16a34a;">KSh ${receipt.totals?.total?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          ${receipt.payment ? `
            <div style="background: #ecfdf5; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
              <div style="font-weight: bold; color: #16a34a; margin-bottom: 8px; font-size: 14px;">M-PESA PAYMENT</div>
              <div style="margin-bottom: 4px;">${receipt.payment.phoneNumber || customerPhone}</div>
              ${receipt.payment.mpesaCode ? `<div style="font-weight: bold; color: #16a34a; font-size: 16px; margin: 8px 0;">${receipt.payment.mpesaCode}</div>` : ''}
              <div style="font-size: 10px; color: #666;">Transaction ID: ${receipt.payment.transactionId || 'N/A'}</div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 30px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #374151;">Thank You for Your Order!</h3>
            <p style="margin: 0 0 15px 0; font-size: 12px; color: #6b7280;">We appreciate your business and trust in Household Planet Kenya</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 11px; color: #6b7280; margin-bottom: 10px;">
              <div>
                <p style="margin: 0; font-weight: bold;">Customer Support</p>
                <p style="margin: 0;">+254790 227 760</p>
              </div>
              <div>
                <p style="margin: 0; font-weight: bold;">Email Support</p>
                <p style="margin: 0;">householdplanet819@gmail.com</p>
              </div>
              <div>
                <p style="margin: 0; font-weight: bold;">Business Hours</p>
                <p style="margin: 0;">Mon-Fri: 8AM-6PM</p>
              </div>
            </div>
            
            <p style="margin: 0; font-size: 10px; color: #9ca3af;">Generated on ${new Date().toLocaleDateString('en-GB')} • Keep this receipt for your records</p>
          </div>
        </div>
      `;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `receipt-${receipt.receiptNumber || receipt.orderNumber || 'order'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF receipt. Please try again.');
    }
  };

  const generateReceiptHTML = (receipt: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.receiptNumber}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f8fafc;
            padding: 20px;
            color: #1e293b;
          }
          .receipt-container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 24px 20px;
            text-align: center;
          }
          .company-name {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .receipt-title {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 24px 20px;
          }
          .receipt-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
          }
          .meta-item {
            text-align: center;
          }
          .meta-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .meta-value {
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
          }
          .customer-section {
            margin-bottom: 24px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .customer-name {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .customer-phone {
            font-size: 14px;
            color: #64748b;
          }
          .items-section {
            margin-bottom: 24px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-details {
            flex: 1;
          }
          .item-name {
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
            margin-bottom: 2px;
          }
          .item-qty {
            font-size: 12px;
            color: #64748b;
          }
          .item-price {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
          }
          .totals-section {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .total-row:last-child {
            margin-bottom: 0;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-weight: 700;
            font-size: 16px;
          }
          .total-label {
            color: #64748b;
            font-size: 14px;
          }
          .total-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 14px;
          }
          .payment-section {
            background: #ecfdf5;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .payment-method {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
          }
          .mpesa-logo {
            width: 24px;
            height: 24px;
            background: #16a34a;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            margin-right: 8px;
          }
          .payment-details {
            text-align: center;
          }
          .transaction-id {
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            color: #475569;
            margin-top: 8px;
          }
          .footer {
            text-align: center;
            padding: 16px 20px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          .thank-you {
            font-size: 14px;
            color: #16a34a;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .footer-note {
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body { background: white !important; padding: 0 !important; }
            .receipt-container { 
              box-shadow: none !important; 
              max-width: none !important;
              margin: 0 !important;
            }
            button { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="company-name">Household Planet Kenya</div>
            <div class="receipt-title">Payment Receipt</div>
          </div>
          
          <div style="padding: 16px 20px; background: white; border-bottom: 1px solid #e2e8f0; text-align: center; display: flex; gap: 12px; justify-content: center;">
            <button onclick="window.print()" style="background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">🖨️ Print</button>
            <button onclick="downloadReceipt()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">📄 Download</button>
          </div>
          
          <div class="content">
            <div class="receipt-meta">
              <div class="meta-item">
                <div class="meta-label">Receipt</div>
                <div class="meta-value">#${receipt.receiptNumber}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Order</div>
                <div class="meta-value">#${receipt.orderNumber}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Date</div>
                <div class="meta-value">${new Date(receipt.paymentDate).toLocaleDateString('en-GB')}</div>
              </div>
            </div>
            
            <div class="customer-section">
              <div class="section-title">Customer</div>
              <div class="customer-name">${receipt.customer.name}</div>
              <div class="customer-phone">${receipt.customer.phone}</div>
            </div>
            
            <div class="items-section">
              <div class="section-title">Items</div>
              ${receipt.items.map((item: any) => `
                <div class="item">
                  <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-qty">Qty: ${item.quantity}</div>
                  </div>
                  <div class="item-price">KSh ${item.total.toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals-section">
              <div class="total-row">
                <span class="total-label">Subtotal</span>
                <span class="total-value">KSh ${receipt.totals.subtotal.toLocaleString()}</span>
              </div>
              ${receipt.totals.discount > 0 ? `
                <div class="total-row">
                  <span class="total-label">Discount${receipt.promoCode ? ` (${receipt.promoCode})` : ''}</span>
                  <span class="total-value" style="color: #16a34a;">-KSh ${receipt.totals.discount.toLocaleString()}</span>
                </div>
              ` : ''}
              ${receipt.totals.shipping > 0 ? `
                <div class="total-row">
                  <span class="total-label">Delivery</span>
                  <span class="total-value">KSh ${receipt.totals.shipping.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="total-row">
                <span class="total-label">Total Paid</span>
                <span class="total-value">KSh ${receipt.totals.total.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="payment-section">
              <div class="payment-method">
                <div class="mpesa-logo">M</div>
                <span style="font-weight: 600; color: #16a34a;">M-Pesa Payment</span>
              </div>
              <div class="payment-details">
                <div style="font-size: 14px; color: #475569; margin-bottom: 4px;">${receipt.payment.phoneNumber}</div>
                ${receipt.payment.mpesaCode ? `<div style="font-weight: 600; color: #16a34a; font-size: 16px; margin-bottom: 8px;">${receipt.payment.mpesaCode}</div>` : ''}
                <div class="transaction-id">ID: ${receipt.payment.transactionId}</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for your purchase!</div>
            <div class="footer-note">Keep this receipt for your records</div>
          </div>
        </div>
        
        <script>
          function downloadReceipt() {
            const receiptContent = document.querySelector('.receipt-container').outerHTML;
            const styles = document.querySelector('style').innerHTML;
            const printHTML = '<!DOCTYPE html><html><head><title>Receipt - ${receipt.receiptNumber}</title><meta charset="UTF-8"><style>' + styles + '.receipt-container { margin: 20px auto; } button { display: none !important; }</style></head><body>' + receiptContent + '</body></html>';
            
            const blob = new Blob([printHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'receipt-${receipt.receiptNumber}.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `;
  };



  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <div className="flex items-center space-x-2">
                {order.source === 'WHATSAPP' && (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <WhatsAppIcon />
                    WhatsApp
                  </Badge>
                )}
                {order.priority && order.priority !== 'NORMAL' && (
                  <Badge className={order.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  order.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}>
                    {order.priority} Priority
                  </Badge>
                )}
                {order.tags && (
                  <Badge variant="outline">
                    {order.tags}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-gray-600 space-y-1">
              <p>
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()} • 
                Last updated {new Date(order.updatedAt).toLocaleDateString()} at {new Date(order.updatedAt).toLocaleTimeString()}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span>Source: {order.source || 'WEB'}</span>
                <span>Items: {order.items?.length || 0}</span>
                <span>Total: KSh {order.total.toLocaleString()}</span>
                {order.deliveryLocation && (
                  <span>Delivery: {order.deliveryLocation}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
            {order.status}
          </Badge>
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </Button>
            </DialogTrigger>
            <Button
              variant="outline"
              onClick={generateShippingLabel}
              disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED' || shippingLoading}
            >
              {shippingLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Truck className="h-4 w-4 mr-2" />
              )}
              {shippingLoading ? 'Generating...' : 'Generate Shipping Label'}
            </Button>
            {order.status === 'DELIVERED' && (
              <Button
                variant="outline"
                onClick={viewReceipt}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            )}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Email to Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                    <SelectItem value="shipping_notification">Shipping Notification</SelectItem>
                    <SelectItem value="delivery_confirmation">Delivery Confirmation</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
                {emailTemplate === 'custom' && (
                  <>
                    <Input
                      placeholder="Email subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                    />
                    <Textarea
                      placeholder="Email message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                    />
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendCustomerEmail} disabled={!emailTemplate}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order ID:</span>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Source:</span>
                  <p className="font-medium">{order.source || 'WEB'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <p className={`font-medium ${
                    order.priority === 'HIGH' ? 'text-orange-600' :
                    order.priority === 'URGENT' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {order.priority || 'NORMAL'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Items Count:</span>
                  <p className="font-medium">{order.items?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Subtotal:</span>
                  <p className="font-medium">KSh {order.subtotal.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Delivery Cost:</span>
                  <p className="font-medium">KSh {(order.deliveryPrice || order.shippingCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-bold text-lg">KSh {order.total.toLocaleString()}</p>
                </div>
              </div>
              {order.tags && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-gray-500 text-sm">Tags:</span>
                  <p className="font-medium">{order.tags}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Order Details */}
          {order.source === 'WHATSAPP' && order.notes && order.notes.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <div className="w-5 h-5 mr-2">
                    <WhatsAppIcon />
                  </div>
                  WhatsApp Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {order.notes.find(note => note.note.includes('WhatsApp Order Details'))?.note || order.notes[0]?.note}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={(() => {
                          try {
                            const images = typeof item.product.images === 'string' 
                              ? JSON.parse(item.product.images) 
                              : item.product.images;
                            const imageUrl = Array.isArray(images) ? images[0] : images;
                            return imageUrl?.startsWith('http') 
                              ? imageUrl 
                              : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
                          } catch {
                            return '/images/placeholder.jpg';
                          }
                        })()} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                        {item.variant && (
                          <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">KSh {item.price.toLocaleString()} each</p>
                        <p className="font-bold">KSh {item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No items found for this order</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>KSh {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Cost:</span>
                  <span>KSh {(order.deliveryPrice || order.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>KSh {order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline & Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status History */}
                <div>
                  <h4 className="font-medium mb-3">Status History</h4>
                  <div className="space-y-3">
                    {order.statusHistory.map((history) => (
                      <div key={history.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Status changed to {history.status}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(history.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                          {history.changedBy && (
                            <p className="text-xs text-gray-500">by {history.changedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communications */}
                {order.communications && order.communications.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Customer Communications</h4>
                    <div className="space-y-3">
                      {order.communications.map((comm) => (
                        <div key={comm.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{comm.type}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comm.sentAt).toLocaleString()}
                            </span>
                          </div>
                          {comm.subject && (
                            <p className="text-sm font-medium mb-1">{comm.subject}</p>
                          )}
                          <p className="text-sm text-gray-600">{comm.message}</p>
                          {comm.sentBy && (
                            <p className="text-xs text-gray-500 mt-1">Sent by: {comm.sentBy}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={order.status} onValueChange={(status) => updateOrderStatus(status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {order.trackingNumber && (
                <div>
                  <label className="text-sm font-medium">Tracking Number</label>
                  <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                </div>
              )}
              
              {/* Delivery Information */}
              {order.delivery && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium mb-2">Delivery Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">{order.delivery.status}</span>
                    </div>
                    {order.delivery.scheduledDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium">
                          {new Date(order.delivery.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {order.delivery.notes && (
                      <div>
                        <span className="text-gray-500">Notes:</span>
                        <p className="text-gray-600 text-xs mt-1">{order.delivery.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Return Requests */}
              {order.returnRequests && order.returnRequests.length > 0 && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium mb-2">Return Requests</h4>
                  <div className="space-y-2">
                    {order.returnRequests.map((returnReq) => (
                      <div key={returnReq.id} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>#{returnReq.returnNumber}</span>
                          <Badge className={returnReq.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                          returnReq.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'}>
                            {returnReq.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{returnReq.reason}</p>
                        <p className="text-gray-500">{new Date(returnReq.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer Name</label>
                  <p className="font-medium text-gray-900">{(() => {
                    if (order.user?.name) return order.user.name;
                    try {
                      const shippingAddr = JSON.parse(order.shippingAddress || '{}');
                      return shippingAddr.fullName || 'Guest Customer';
                    } catch {
                      return 'Guest Customer';
                    }
                  })()}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                  <p className="text-sm font-medium text-blue-600">
                    {(() => {
                      const userEmail = order.user?.email;
                      if (userEmail?.endsWith('@whatsapp.temp')) {
                        return (
                          <span className="flex items-center">
                            <div className="w-4 h-4 mr-1">
                              <WhatsAppIcon />
                            </div>
                            WhatsApp User
                          </span>
                        );
                      }
                      if (userEmail) {
                        return (
                          <a href={`mailto:${userEmail}`} className="hover:underline">
                            {userEmail}
                          </a>
                        );
                      }
                      // Try to get email from shipping address for guest orders
                      try {
                        const shippingAddr = JSON.parse(order.shippingAddress || '{}');
                        const guestEmail = shippingAddr.email;
                        if (guestEmail && guestEmail.trim()) {
                          return (
                            <a href={`mailto:${guestEmail}`} className="hover:underline">
                              {guestEmail}
                            </a>
                          );
                        }
                      } catch {}
                      return <span className="text-gray-400 italic">Guest Order</span>;
                    })()}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                  {(() => {
                    const userPhone = order.user?.phone;
                    if (userPhone) {
                      return (
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            <a href={`tel:${userPhone}`} className="hover:underline">
                              {userPhone}
                            </a>
                          </p>
                          {order.user.phoneVerified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      );
                    }
                    // Try to get phone from shipping address for guest orders
                    try {
                      const shippingAddr = JSON.parse(order.shippingAddress || '{}');
                      const guestPhone = shippingAddr.phone;
                      if (guestPhone && guestPhone.trim()) {
                        return (
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              <a href={`tel:${guestPhone}`} className="hover:underline">
                                {guestPhone}
                              </a>
                            </p>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Guest
                            </Badge>
                          </div>
                        );
                      }
                    } catch {}
                    return <p className="text-sm text-gray-400 italic">No phone number provided</p>;
                  })()}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2 border-t">
                {(() => {
                  let phone = order.user?.phone;
                  let email = order.user?.email;
                  
                  // Get contact info from shipping address for guest orders
                  if (!phone || !email) {
                    try {
                      const shippingAddr = JSON.parse(order.shippingAddress || '{}');
                      phone = phone || shippingAddr.phone;
                      email = email || shippingAddr.email;
                    } catch {}
                  }
                  
                  return (
                    <>
                      {phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${phone}`, '_self')}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call Customer
                        </Button>
                      )}
                      {email && !email.endsWith('@whatsapp.temp') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`mailto:${email}`, '_self')}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.deliveryLocation && (
                <div>
                  <h4 className="font-medium mb-2">Delivery Location</h4>
                  <p className="text-sm text-gray-600">{order.deliveryLocation}</p>
                  {order.deliveryPrice && (
                    <p className="text-sm text-gray-600">Delivery Cost: KSh {order.deliveryPrice.toLocaleString()}</p>
                  )}
                </div>
              )}
              
              {order.shippingAddress && (() => {
                try {
                  const address = JSON.parse(order.shippingAddress);
                  return (
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Name:</strong> {order.user?.name || address.fullName}</p>
                        {order.user?.phone && <p><strong>Phone:</strong> {order.user.phone}</p>}
                        {order.user?.email && <p><strong>Email:</strong> {order.user.email}</p>}
                        <p><strong>Address:</strong> {address.street}, {address.town}, {address.county}</p>
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })()}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Delivery Cost:</span>
                  <p className="font-medium">KSh {(order.deliveryPrice || order.shippingCost || 0).toLocaleString()}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <span className="text-gray-500">Tracking:</span>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Method:</span>
                  <p className="font-medium">
                    {order.paymentMethod === 'MPESA' ? 'M-Pesa' :
                     order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' :
                     order.paymentMethod === 'CARD' ? 'Credit/Debit Card' :
                     order.paymentMethod}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                                  order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>KSh {order.subtotal.toLocaleString()}</span>
                </div>
                {order.promoCode && order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm bg-green-100 -mx-1 px-2 py-1 rounded">
                    <span className="text-green-700 font-medium">Promo Discount ({order.promoCode})</span>
                    <span className="font-medium text-green-600">-KSh {order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Delivery Cost:</span>
                  <span>KSh {(order.deliveryPrice || order.shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Amount:</span>
                  <span className="font-bold text-lg">KSh {order.total.toLocaleString()}</span>
                </div>
              </div>
              
              {order.paymentTransactions && order.paymentTransactions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Payment Transactions</h4>
                  <div className="space-y-2">
                    {order.paymentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>ID: {transaction.checkoutRequestId}</span>
                          <Badge className={transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {transaction.status}
                          </Badge>
                        </div>
                        {transaction.mpesaReceiptNumber && (
                          <p>Receipt: {transaction.mpesaReceiptNumber}</p>
                        )}
                        <p>Amount: KSh {transaction.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Internal note</span>
                  </label>
                  <Button size="sm" onClick={addOrderNote} disabled={!newNote.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{note.note}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {note.createdBy && (
                          <span className="text-xs text-gray-500">by {note.createdBy}</span>
                        )}
                        <Badge variant={note.isInternal ? 'secondary' : 'outline'} className="text-xs">
                          {note.isInternal ? 'Internal' : 'Customer'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}