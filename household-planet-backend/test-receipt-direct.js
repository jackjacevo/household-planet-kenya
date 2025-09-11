const { PrismaClient } = require('@prisma/client');

async function testReceiptGeneration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing receipt generation directly...\n');
    
    // Find an order with completed payment
    const orderWithPayment = await prisma.order.findFirst({
      where: {
        paymentTransactions: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        user: true,
        items: { 
          include: { 
            product: { select: { name: true, images: true } },
            variant: { select: { name: true } }
          } 
        },
        paymentTransactions: { 
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!orderWithPayment) {
      console.log('No order with completed payment found');
      return;
    }
    
    console.log(`Testing with order: ${orderWithPayment.orderNumber}`);
    console.log(`Order ID: ${orderWithPayment.id}`);
    console.log(`Items: ${orderWithPayment.items.length}`);
    console.log(`Payments: ${orderWithPayment.paymentTransactions.length}`);
    
    // Simulate the receipt generation logic
    const latestPayment = orderWithPayment.paymentTransactions[0];
    
    // Calculate subtotal from order items if not available
    const calculatedSubtotal = orderWithPayment.items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);
    
    const subtotal = orderWithPayment.subtotal ? Number(orderWithPayment.subtotal) : calculatedSubtotal;
    const shipping = Number(orderWithPayment.deliveryPrice || orderWithPayment.shippingCost || 0);
    const total = Number(orderWithPayment.total);
    
    const receipt = {
      receiptNumber: `RCP-${orderWithPayment.orderNumber}-${Date.now()}`,
      orderNumber: orderWithPayment.orderNumber,
      date: new Date().toISOString(),
      paymentDate: latestPayment.transactionDate || latestPayment.createdAt,
      customer: {
        name: orderWithPayment.user?.name || 'Guest Customer',
        email: orderWithPayment.user?.email || 'guest@example.com',
        phone: orderWithPayment.user?.phone || latestPayment.phoneNumber || 'N/A'
      },
      items: orderWithPayment.items && orderWithPayment.items.length > 0 ? orderWithPayment.items.map(item => ({
        name: item.product?.name || 'Unknown Product',
        variant: item.variant?.name || null,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        total: Number(item.price) * item.quantity,
        image: item.product?.images || null
      })) : [{
        name: 'Service/Product',
        variant: null,
        quantity: 1,
        unitPrice: total,
        total: total,
        image: null
      }],
      payment: {
        method: latestPayment.provider === 'MPESA' ? 'M-Pesa' : latestPayment.provider,
        phoneNumber: latestPayment.phoneNumber || 'N/A',
        amount: Number(latestPayment.amount),
        mpesaCode: latestPayment.mpesaReceiptNumber || null,
        transactionId: latestPayment.checkoutRequestId || 'N/A'
      },
      totals: {
        subtotal,
        shipping,
        total
      },
      company: {
        name: 'Household Planet Kenya',
        phone: '+254790227760',
        email: 'householdplanet819@gmail.com'
      }
    };
    
    console.log('\nReceipt generated successfully!');
    console.log('Receipt structure:');
    console.log('- Receipt Number:', receipt.receiptNumber);
    console.log('- Order Number:', receipt.orderNumber);
    console.log('- Customer:', receipt.customer.name);
    console.log('- Items:', receipt.items.length);
    console.log('- Payment Method:', receipt.payment.method);
    console.log('- Total:', receipt.totals.total);
    
    console.log('\nFull receipt data:');
    console.log(JSON.stringify(receipt, null, 2));
    
  } catch (error) {
    console.error('Error generating receipt:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReceiptGeneration();