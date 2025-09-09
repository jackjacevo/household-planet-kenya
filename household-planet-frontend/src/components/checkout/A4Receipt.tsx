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
                      order.user?.name || 
                      (order.user?.firstName && order.user?.lastName ? `${order.user.firstName} ${order.user.lastName}` : '') ||
                      (order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress.fullName : null) || 
                      'Valued Customer';
  
  const customerPhone = order.customerPhone || 
                       order.user?.phone || 
                       (order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress.phone : null) || 
                       'N/A';
  
  const customerEmail = order.customerEmail || 
                       order.user?.email || 
                       (order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress.email : null) || 
                       'N/A';
  
  return (
    <div className="hidden print:block w-full max-w-[210mm] mx-auto bg-white text-black p-8 font-sans text-sm">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">HOUSEHOLD PLANET</h1>
          <p className="text-green-100 text-sm mb-1">Kenya's Premier Home & Living Store</p>
          <div className="flex justify-center items-center space-x-4 text-xs text-green-100">
            <span>📞 +254790 227 760</span>
            <span>•</span>
            <span>📧 householdplanet819@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Receipt Info Cards */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-800 mb-2">ORDER DETAILS</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Receipt #:</span> <span className="font-mono font-bold">{order.orderNumber}</span></p>
            <p><span className="text-gray-600">Order Date:</span> <span className="font-medium">{orderDate}</span></p>
            <p><span className="text-gray-600">Tracking #:</span> <span className="font-mono text-blue-600">{trackingNumber}</span></p>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h3 className="font-bold text-green-800 mb-2">CUSTOMER INFO</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Name:</span> <span className="font-medium">{customerName}</span></p>
            <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{customerPhone}</span></p>
            <p><span className="text-gray-600">Location:</span> <span className="font-medium">{typeof order.deliveryLocation === 'string' ? order.deliveryLocation : order.deliveryLocation?.name || 'N/A'}</span></p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <div className="bg-gray-100 p-3 rounded-t-lg">
          <h3 className="font-bold text-gray-800">ORDER ITEMS</h3>
        </div>
        
        <div className="border border-gray-200 rounded-b-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 p-3 font-bold text-xs text-gray-700">
              <div className="col-span-6">PRODUCT</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-right">UNIT PRICE</div>
              <div className="col-span-2 text-right">TOTAL</div>
            </div>
          </div>
          
          {order.items.map((item, index) => (
            <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="col-span-6">
                <div className="font-medium text-gray-800">{item.product.name}</div>
                {item.variant && (
                  <div className="text-gray-500 text-xs mt-1">
                    {item.variant.size && `Size: ${item.variant.size}`}
                    {item.variant.color && ` • Color: ${item.variant.color}`}
                  </div>
                )}
              </div>
              <div className="col-span-2 text-center font-medium">{item.quantity}</div>
              <div className="col-span-2 text-right text-gray-600">{formatPrice(item.price)}</div>
              <div className="col-span-2 text-right font-bold text-green-600">{formatPrice(item.total)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({order.items?.length || 0} items):</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          {order.promoCode && order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({order.promoCode}):</span>
              <span className="font-medium">-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="font-medium">{formatPrice(order.deliveryPrice || order.shippingCost || 0)}</span>
          </div>
          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-800">TOTAL AMOUNT:</span>
              <span className="text-green-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Status */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <h3 className="font-bold text-orange-800 mb-2">PAYMENT INFO</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Method:</span> <span className="font-medium">{
              order.paymentMethod === 'MPESA' ? '📱 M-Pesa' :
              order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Cash on Delivery' :
              order.paymentMethod === 'CARD' ? '💳 Card Payment' :
              order.paymentMethod === 'BANK_TRANSFER' ? '🏦 Bank Transfer' :
              order.paymentMethod || 'N/A'
            }</span></p>
            <p><span className="text-gray-600">Status:</span> <span className={`font-medium px-2 py-1 rounded text-xs ${
              order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
              order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>{order.paymentStatus || 'PENDING'}</span></p>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <h3 className="font-bold text-purple-800 mb-2">DELIVERY INFO</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Status:</span> <span className="font-medium">{order.status || 'PENDING'}</span></p>
            <p><span className="text-gray-600">Est. Delivery:</span> <span className="font-medium">{new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB')}</span></p>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg text-center">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🎉 Thank You for Your Order!</h3>
          <p className="text-gray-600 text-sm">We appreciate your business and trust in Household Planet Kenya</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-medium">📞 Customer Support</p>
            <p>WhatsApp: +254790 227 760</p>
          </div>
          <div>
            <p className="font-medium">🚚 Track Your Order</p>
            <p>Use tracking: {trackingNumber}</p>
          </div>
          <div>
            <p className="font-medium">📧 Need Help?</p>
            <p>householdplanet819@gmail.com</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-500">Keep this receipt for your records • Generated on {currentDate}</p>
        </div>
      </div>
    </div>
  );
}