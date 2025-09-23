import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy - Household Planet Kenya',
  description: 'Learn about our return and refund procedures, timeframes, and conditions.',
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Return & Refund Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-700 mb-4">
                At Household Planet Kenya, we want you to be completely satisfied with your purchase. If you're not happy with your order, we offer a comprehensive return and refund policy to ensure your peace of mind.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Timeframes</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Standard Returns</h3>
                  <p className="text-green-800">You have <strong>30 days</strong> from the delivery date to return most items for a full refund.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Electronics & Appliances</h3>
                  <p className="text-blue-800">Electronic items have a <strong>14-day</strong> return window due to their nature.</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-900 mb-2">Perishable Items</h3>
                  <p className="text-yellow-800">Food items and perishables must be returned within <strong>24 hours</strong> of delivery.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Conditions</h2>
              <p className="text-gray-700 mb-4">To be eligible for a return, items must meet the following conditions:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Items must be in original condition and packaging</li>
                <li>All tags, labels, and protective films must be intact</li>
                <li>Items must not show signs of use or damage</li>
                <li>Original receipt or order confirmation must be provided</li>
                <li>Items must be returned with all accessories and manuals</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Returnable Items</h2>
              <p className="text-gray-700 mb-4">The following items cannot be returned for hygiene and safety reasons:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Personal care items (toothbrushes, cosmetics, etc.)</li>
                <li>Underwear and intimate apparel</li>
                <li>Opened food items and beverages</li>
                <li>Custom or personalized items</li>
                <li>Digital products and gift cards</li>
                <li>Items damaged by misuse or normal wear</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Return Items</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Step 1: Initiate Return</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Log into your account and go to "My Orders"</li>
                    <li>Select the order and click "Return Items"</li>
                    <li>Choose the items you want to return and reason</li>
                    <li>Submit your return request</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Step 2: Package Items</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Pack items securely in original packaging</li>
                    <li>Include the return authorization form</li>
                    <li>Ensure all accessories are included</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Step 3: Ship or Schedule Pickup</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Use our prepaid return label (if provided)</li>
                    <li>Schedule a free pickup for orders over KES 2,000</li>
                    <li>Drop off at any of our partner locations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Time</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Returns are processed within 3-5 business days of receipt</li>
                    <li>You'll receive email confirmation once processed</li>
                    <li>Refunds are issued to the original payment method</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Refund Timeline</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li><strong>M-Pesa:</strong> 1-2 business days</li>
                    <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                    <li><strong>Bank Transfer:</strong> 3-5 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Shipping</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">Free Returns</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Orders over KES 2,000 qualify for free return shipping</li>
                  <li>Defective or incorrect items - we cover all return costs</li>
                  <li>We'll provide a prepaid return label</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Return Fees</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Orders under KES 2,000: KES 200 return shipping fee</li>
                  <li>Customer preference returns may incur shipping costs</li>
                  <li>Fees are deducted from your refund amount</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exchanges</h2>
              <p className="text-gray-700 mb-4">
                We currently don't offer direct exchanges. To exchange an item:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Return the original item following our return process</li>
                <li>Place a new order for the desired item</li>
                <li>Once we receive your return, we'll process the refund</li>
                <li>Your new order will be processed and shipped separately</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Defective Items</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-900 mb-2">Immediate Action Required</h3>
                <p className="text-red-800 mb-2">If you receive damaged or defective items:</p>
                <ul className="list-disc pl-6 space-y-1 text-red-800">
                  <li>Contact us within 24 hours of delivery</li>
                  <li>Provide photos of the damaged item and packaging</li>
                  <li>Keep all original packaging and materials</li>
                  <li>We'll arrange immediate replacement or full refund</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Partial Returns</h2>
              <p className="text-gray-700 mb-4">
                You can return individual items from a multi-item order. The refund will be calculated based on the individual item price, and any applicable discounts will be proportionally adjusted.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-2 text-gray-700">
                <p>For return-related questions or assistance:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> returns@householdplanetkenya.co.ke</li>
                  <li><strong>Phone:</strong> +254 700 000 000</li>
                  <li><strong>WhatsApp:</strong> +254 700 000 000</li>
                  <li><strong>Live Chat:</strong> Available on our website 9 AM - 6 PM</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
