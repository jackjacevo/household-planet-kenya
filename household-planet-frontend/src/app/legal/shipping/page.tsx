import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy - Household Planet Kenya',
  description: 'Learn about our shipping options, delivery timeframes, and policies across Kenya.',
};

export default function ShippingDeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping & Delivery Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Areas</h2>
              <p className="text-gray-700 mb-4">
                We currently deliver to the following areas in Kenya:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Major Cities (Same Day/Next Day)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-green-800">
                    <li>Nairobi & Surrounding Areas</li>
                    <li>Mombasa</li>
                    <li>Kisumu</li>
                    <li>Nakuru</li>
                    <li>Eldoret</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Other Towns (2-5 Days)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-blue-800">
                    <li>Thika, Kiambu, Machakos</li>
                    <li>Meru, Nyeri, Embu</li>
                    <li>Kericho, Bomet, Narok</li>
                    <li>Kitale, Bungoma, Kakamega</li>
                    <li>And many more locations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Options</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">🚀 Express Delivery</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 mb-2"><strong>Timeframe:</strong> Same day or next day</p>
                      <p className="text-gray-700 mb-2"><strong>Areas:</strong> Nairobi, Mombasa, Kisumu</p>
                      <p className="text-gray-700"><strong>Cost:</strong> KES 300-500</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2"><strong>Cutoff Time:</strong> 2 PM for same day</p>
                      <p className="text-gray-700 mb-2"><strong>Tracking:</strong> Real-time GPS tracking</p>
                      <p className="text-gray-700"><strong>Free:</strong> Orders over KES 5,000</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">🚚 Standard Delivery</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 mb-2"><strong>Timeframe:</strong> 2-5 business days</p>
                      <p className="text-gray-700 mb-2"><strong>Areas:</strong> All delivery locations</p>
                      <p className="text-gray-700"><strong>Cost:</strong> KES 150-300</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2"><strong>Tracking:</strong> SMS and email updates</p>
                      <p className="text-gray-700 mb-2"><strong>Free:</strong> Orders over KES 2,000</p>
                      <p className="text-gray-700"><strong>Most Popular:</strong> ⭐ Recommended</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">📦 Pickup Points</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 mb-2"><strong>Timeframe:</strong> 1-3 business days</p>
                      <p className="text-gray-700 mb-2"><strong>Locations:</strong> 50+ pickup points</p>
                      <p className="text-gray-700"><strong>Cost:</strong> KES 100</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2"><strong>Hours:</strong> Extended pickup hours</p>
                      <p className="text-gray-700 mb-2"><strong>Security:</strong> Secure storage</p>
                      <p className="text-gray-700"><strong>Free:</strong> Orders over KES 1,500</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Costs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Express</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Point</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Under KES 1,500</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 200</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 400</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 100</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 1,500 - 2,000</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 150</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 350</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 2,000 - 5,000</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KES 300</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Over KES 5,000</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">FREE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Processing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Times</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li><strong>In-stock items:</strong> Same day processing (orders before 2 PM)</li>
                    <li><strong>Pre-order items:</strong> 1-3 business days</li>
                    <li><strong>Custom items:</strong> 5-10 business days</li>
                    <li><strong>Bulk orders:</strong> 2-5 business days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Confirmation</h3>
                  <p className="text-gray-700 mb-2">Once your order is processed, you'll receive:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Order confirmation email with tracking number</li>
                    <li>SMS notification with delivery estimate</li>
                    <li>Real-time tracking updates</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Process</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Before Delivery</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>We'll call or SMS you 30 minutes before delivery</li>
                    <li>Ensure someone is available to receive the package</li>
                    <li>Have your ID ready for verification</li>
                    <li>Prepare the delivery address and any special instructions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">During Delivery</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Inspect packages before signing for delivery</li>
                    <li>Report any visible damage immediately</li>
                    <li>Keep your receipt and delivery confirmation</li>
                    <li>Rate your delivery experience</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Failed Delivery</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>We'll attempt delivery up to 3 times</li>
                    <li>You'll be notified of each attempt</li>
                    <li>After 3 attempts, packages are held for 7 days</li>
                    <li>Unclaimed packages are returned to our warehouse</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Special Delivery Instructions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Large Items</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Furniture and appliances require special handling</li>
                    <li>Delivery to ground floor only (unless arranged)</li>
                    <li>Assembly service available for additional fee</li>
                    <li>2-person delivery team for heavy items</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Fragile Items</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Extra protective packaging included</li>
                    <li>Careful handling protocols followed</li>
                    <li>Insurance coverage available</li>
                    <li>Immediate damage reporting required</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tracking Your Order</h2>
              <div className="space-y-4 text-gray-700">
                <p>Track your order through multiple channels:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Website:</strong> Log into your account and view order status</li>
                  <li><strong>SMS:</strong> Receive automatic updates at key milestones</li>
                  <li><strong>Email:</strong> Detailed tracking information and updates</li>
                  <li><strong>WhatsApp:</strong> Real-time updates via our WhatsApp bot</li>
                  <li><strong>Phone:</strong> Call our customer service for live updates</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Delays</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Possible Causes</h3>
                <ul className="list-disc pl-6 space-y-1 text-yellow-800">
                  <li>Weather conditions and natural disasters</li>
                  <li>Traffic congestion in major cities</li>
                  <li>Public holidays and weekends</li>
                  <li>Incorrect or incomplete delivery addresses</li>
                  <li>Recipient unavailability</li>
                </ul>
                <p className="text-yellow-800 mt-3">
                  <strong>We'll always notify you of any delays and provide updated delivery estimates.</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Shipping</h2>
              <p className="text-gray-700 mb-4">
                Currently, we only deliver within Kenya. We're working on expanding our services to other East African countries. Subscribe to our newsletter to be notified when international shipping becomes available.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Delivery Support</h2>
              <div className="space-y-2 text-gray-700">
                <p>For delivery-related questions or issues:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> delivery@householdplanet.co.ke</li>
                  <li><strong>Phone:</strong> +254 700 000 000</li>
                  <li><strong>WhatsApp:</strong> +254 700 000 000</li>
                  <li><strong>Live Chat:</strong> Available 24/7 on our website</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}