export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Shipping and Delivery Policy</h1>
      <p className="text-gray-600">Last updated: January 1, 2025</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Delivery Areas</h2>
        <p>We currently deliver to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nairobi and surrounding areas</li>
          <li>Mombasa and Coast region</li>
          <li>Kisumu and Western Kenya</li>
          <li>Nakuru and Central Kenya</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Delivery Times</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left">Location</th>
                <th className="border border-gray-300 p-3 text-left">Standard Delivery</th>
                <th className="border border-gray-300 p-3 text-left">Express Delivery</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3">Nairobi CBD</td>
                <td className="border border-gray-300 p-3">1-2 business days</td>
                <td className="border border-gray-300 p-3">Same day</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Nairobi Suburbs</td>
                <td className="border border-gray-300 p-3">2-3 business days</td>
                <td className="border border-gray-300 p-3">Next day</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Other Cities</td>
                <td className="border border-gray-300 p-3">3-5 business days</td>
                <td className="border border-gray-300 p-3">2-3 business days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Shipping Costs</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Free shipping on orders over KES 5,000</li>
          <li>Standard shipping: KES 200-500 depending on location</li>
          <li>Express shipping: KES 500-1,000 depending on location</li>
          <li>Same-day delivery (Nairobi): KES 800</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Order Processing</h2>
        <p>Orders are processed Monday through Friday:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Orders placed before 2 PM are processed the same day</li>
          <li>Orders placed after 2 PM are processed the next business day</li>
          <li>Weekend orders are processed on Monday</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Delivery Options</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">Home Delivery</h3>
            <p className="text-sm text-gray-600">Direct delivery to your doorstep</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">Pickup Points</h3>
            <p className="text-sm text-gray-600">Collect from designated pickup locations</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">Office Delivery</h3>
            <p className="text-sm text-gray-600">Delivery to your workplace</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Tracking Your Order</h2>
        <p>Once your order ships, you'll receive:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email confirmation with tracking number</li>
          <li>SMS updates on delivery status</li>
          <li>Real-time tracking through our website</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Delivery Requirements</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Someone must be available to receive the delivery</li>
          <li>Valid ID may be required for high-value items</li>
          <li>Delivery address must be accessible by vehicle</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Failed Delivery</h2>
        <p>If delivery fails:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>We'll attempt delivery up to 3 times</li>
          <li>You'll be contacted to reschedule</li>
          <li>Items may be returned to our warehouse after 7 days</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Contact Delivery Support</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Delivery Support:</strong> delivery@householdplanet.co.ke</p>
          <p><strong>Phone:</strong> +254-XXX-XXXX-XXX</p>
          <p><strong>WhatsApp:</strong> +254-XXX-XXXX-XXX</p>
        </div>
      </section>
    </div>
  );
}