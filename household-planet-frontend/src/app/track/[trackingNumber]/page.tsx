import OrderTracking from '@/components/delivery/OrderTracking';

export default async function TrackingPage({ params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params;
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderTracking trackingNumber={trackingNumber} />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Track Your Order - Household Planet Kenya',
  description: 'Track your delivery in real-time with detailed status updates.',
};