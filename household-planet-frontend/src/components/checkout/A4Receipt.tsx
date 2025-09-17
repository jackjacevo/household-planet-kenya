'use client';

import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

interface A4ReceiptProps {
  order: Order;
  trackingNumber: string;
}

export default function A4Receipt({ order, trackingNumber }: A4ReceiptProps) {
  const currentDate = new Date().toLocaleDateString('en-GB');
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : currentDate;
  
  // Get customer info from multiple sources
  const customerName = order.customerName || 
                      (order as any).user?.name || 
                      ((order as any).user?.firstName && (order as any).user?.lastName ? `${(order as any).user.firstName} ${(order as any).user.lastName}` : '') ||
                      (order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress.fullName : null) || 
                      'Valued Customer';
  
  const customerPhone = order.customerPhone || 
                       (order as any).user?.phone || 
                       (order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress.phone : null) || 
                       'N/A';
  
  const customerEmail = order.customerEmail || 
                       (order as any).user?.email || 
                       'N/A';
  
  return (
    <div className="hidden print:block w-full max-w-[210mm] mx-auto bg-white text-black font-sans" style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid', minHeight: '297mm', maxHeight: '297mm', overflow: 'hidden' }}>
      <div className="p-3 text-xs leading-tight" style={{ pageBreakInside: 'avoid' }}>
        {/* Header */}
        <div className="text-center mb-4 pb-3 border-b-2 border-green-600">
          <h1 className="text-xl font-bold text-green-600 mb-2">HOUSEHOLD PLANET KENYA</h1>
          <p className="text-sm text-gray-600 mb-2">Your Premier Home & Living Store</p>
          <div className="text-sm text-gray-500">
            📞 +254790 227 760 • 📧 householdplanet819@gmail.com
          </div>
        </div>

        {/* Order & Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-300 p-3 rounded">
            <h3 className="font-bold text-sm text-blue-800 mb-2">ORDER DETAILS</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Receipt #:</span> <span className="font-bold">{order.orderNumber}</span></p>
              <p><span className="text-gray-600">Date:</span> {orderDate}</p>
              <p><span className="text-gray-600">Tracking:</span> {trackingNumber}</p>
            </div>
          </div>
          
          <div className="border border-gray-300 p-3 rounded">
            <h3 className="font-bold text-sm text-green-800 mb-2">CUSTOMER INFO</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Name:</span> {customerName}</p>
              <p><span className="text-gray-600">Phone:</span> {customerPhone}</p>
              <p><span className="text-gray-600">Location:</span> {typeof order.deliveryLocation === 'string' ? order.deliveryLocation : order.deliveryLocation?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <h3 className="font-bold text-sm text-gray-800 mb-2 bg-gray-100 p-2 rounded">ORDER ITEMS ({order.items?.length || 0})</h3>
          
          <div className="border border-gray-200 rounded">
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-1 p-1 font-bold text-xs text-gray-700">
                <div className="col-span-6">PRODUCT</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-right">PRICE</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>
            </div>
            
            {order.items.map((item, index) => (
              <div key={item.id} className={`grid grid-cols-12 gap-1 p-0.5 text-xs ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="col-span-6">
                  <div className="font-medium text-gray-800 leading-tight">{item.product.name}</div>
                  {item.variant && (
                    <div className="text-gray-500 text-xs">
                      {item.variant.size && `${item.variant.size}`}
                      {item.variant.color && ` • ${item.variant.color}`}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-center font-medium">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatPrice(item.price)}</div>
                <div className="col-span-2 text-right font-bold">{formatPrice(item.total)}</div>
              </div>
            ))}
          </div>
          

        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-3 rounded border mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({order.items?.length || 0} items):</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            {(order as any).promoCode && (order as any).discountAmount && (order as any).discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({(order as any).promoCode}):</span>
                <span className="font-medium">-{formatPrice((order as any).discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-medium">{formatPrice(order.deliveryPrice || order.shippingCost || 0)}</span>
            </div>
            <div className="border-t border-gray-300 pt-1">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL AMOUNT:</span>
                <span className="text-green-600">
                  {formatPrice(
                    order.subtotal - 
                    ((order as any).discountAmount || 0) + 
                    (order.deliveryPrice || order.shippingCost || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Delivery Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-300 p-3 rounded">
            <h3 className="font-bold text-sm text-orange-800 mb-2">PAYMENT</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Method:</span> {
                order.paymentMethod === 'MPESA' ? 'M-Pesa' :
                order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' :
                order.paymentMethod === 'CARD' ? 'Card Payment' :
                order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' :
                order.paymentMethod || 'N/A'
              }</p>
            </div>
          </div>
          
          <div className="border border-gray-300 p-3 rounded">
            <h3 className="font-bold text-sm text-purple-800 mb-2">DELIVERY</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Status:</span> {order.status || 'PENDING'}</p>
              <p><span className="text-gray-600">Est. Delivery:</span> {new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-300 pt-3 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Thank You for Your Order!</h3>
          <p className="text-sm text-gray-600 mb-3">We appreciate your business and trust in Household Planet Kenya</p>
          
          <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-2">
            <div>
              <p className="font-medium">Customer Support</p>
              <p>+254790 227 760</p>
            </div>
            <div>
              <p className="font-medium">Track Order</p>
              <p>{trackingNumber}</p>
            </div>
            <div>
              <p className="font-medium">Email Support</p>
              <p>householdplanet819@gmail.com</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">Generated on {currentDate} • Keep this receipt for your records</p>
        </div>
      </div>
    </div>
  );
}
