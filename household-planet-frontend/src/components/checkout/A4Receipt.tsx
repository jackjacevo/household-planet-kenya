'use client';

import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

interface A4ReceiptProps {
  order: Order;
  trackingNumber: string;
}

export default function A4Receipt({ order, trackingNumber }: A4ReceiptProps) {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return (
    <div className="hidden print:block w-full max-w-[210mm] mx-auto bg-white text-black p-8 font-mono text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">HOUSEHOLD PLANET KENYA</h1>
        <p className="text-xs">Your Trusted Home & Living Partner</p>
        <p className="text-xs">📞 +254790 227 760 | 📧 householdplanet819@gmail.com</p>
      </div>

      {/* Receipt Info */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-xs">
        <div>
          <p><strong>RECEIPT #:</strong> {order.orderNumber}</p>
          <p><strong>DATE:</strong> {currentDate}</p>
          <p><strong>TRACKING:</strong> {trackingNumber}</p>
        </div>
        <div>
          <p><strong>CUSTOMER:</strong> {order.customerName || 'N/A'}</p>
          <p><strong>PHONE:</strong> {order.customerPhone || 'N/A'}</p>
          <p><strong>LOCATION:</strong> {typeof order.deliveryLocation === 'string' ? order.deliveryLocation : order.deliveryLocation?.name || 'N/A'}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <div className="border-b border-black pb-2 mb-4">
          <div className="grid grid-cols-12 gap-2 font-bold text-xs">
            <div className="col-span-6">ITEM</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-2 text-right">PRICE</div>
            <div className="col-span-2 text-right">TOTAL</div>
          </div>
        </div>
        
        {order.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 py-1 text-xs">
            <div className="col-span-6">
              <div className="font-medium">{item.product.name}</div>
              {item.variant && (
                <div className="text-gray-600 text-xs">
                  {item.variant.size && `Size: ${item.variant.size}`}
                  {item.variant.color && ` • Color: ${item.variant.color}`}
                </div>
              )}
            </div>
            <div className="col-span-2 text-center">{item.quantity}</div>
            <div className="col-span-2 text-right">{formatPrice(item.price)}</div>
            <div className="col-span-2 text-right font-medium">{formatPrice(item.total)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t-2 border-black pt-4 mb-6">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>SUBTOTAL ({order.items?.length || 0} items):</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>DELIVERY:</span>
            <span>{formatPrice(order.deliveryPrice || order.shippingCost || 0)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-black pt-2">
            <span>TOTAL:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-6 text-xs">
        <p><strong>PAYMENT METHOD:</strong> {
          order.paymentMethod === 'MPESA' ? 'M-Pesa' :
          order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' :
          order.paymentMethod === 'CARD' ? 'Card Payment' :
          order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' :
          order.paymentMethod || 'N/A'
        }</p>
        <p><strong>PAYMENT STATUS:</strong> {order.paymentStatus || 'PENDING'}</p>
      </div>

      {/* Footer */}
      <div className="border-t border-black pt-4 text-center text-xs">
        <p className="mb-2"><strong>Thank you for shopping with us!</strong></p>
        <p>🚚 Estimated Delivery: {new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB')}</p>
        <p className="mt-4">For support: WhatsApp +254790 227 760</p>
        <p className="mt-2 text-xs">Keep this receipt for your records</p>
      </div>
    </div>
  );
}