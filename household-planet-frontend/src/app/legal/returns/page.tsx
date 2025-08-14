export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Return and Refund Policy</h1>
      <p className="text-gray-600">Last updated: January 1, 2025</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Return Period</h2>
        <p>You have 30 days from the date of delivery to return items for a full refund.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Eligible Items</h2>
        <p>Items must be:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>In original condition and packaging</li>
          <li>Unused and undamaged</li>
          <li>Include all original accessories and documentation</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Non-Returnable Items</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Perishable goods (food, flowers, plants)</li>
          <li>Personal care items</li>
          <li>Custom or personalized products</li>
          <li>Digital downloads</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Return Process</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Contact our customer service at returns@householdplanet.co.ke</li>
          <li>Provide your order number and reason for return</li>
          <li>Receive return authorization and shipping instructions</li>
          <li>Package items securely and ship to our return center</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Refund Processing</h2>
        <p>Once we receive and inspect your return:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Approved refunds are processed within 5-7 business days</li>
          <li>Refunds are issued to the original payment method</li>
          <li>Shipping costs are non-refundable unless item was defective</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Exchanges</h2>
        <p>We offer exchanges for defective or damaged items. Contact us within 7 days of delivery for expedited processing.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Return Shipping</h2>
        <p>Customers are responsible for return shipping costs unless the item was defective or we made an error.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Contact Us</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Returns Email:</strong> returns@householdplanet.co.ke</p>
          <p><strong>Customer Service:</strong> +254-XXX-XXXX-XXX</p>
          <p><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EAT</p>
        </div>
      </section>
    </div>
  );
}