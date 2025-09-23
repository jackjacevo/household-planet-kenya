import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Data Protection Agreement - Household Planet Kenya',
  description: 'Our commitment to protecting your personal data and privacy rights.',
};

export default function DataProtectionAgreementPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Data Protection Agreement</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900 text-lg font-medium mb-3">
                  Household Planet Kenya is committed to protecting your personal data and respecting your privacy rights in accordance with the General Data Protection Regulation (GDPR) and Kenya's Data Protection Act.
                </p>
                <p className="text-blue-800">
                  This agreement outlines how we collect, process, store, and protect your personal information, and your rights regarding your data.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Controller Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="list-none space-y-2 text-gray-700">
                  <li><strong>Company:</strong> Household Planet Kenya Limited</li>
                  <li><strong>Registration:</strong> [Company Registration Number]</li>
                  <li><strong>Address:</strong> Nairobi, Kenya</li>
                  <li><strong>Data Protection Officer:</strong> dpo@householdplanetkenya.co.ke</li>
                  <li><strong>Contact:</strong> +254 700 000 000</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Personal Data We Process</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Identity Data</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Full name and title</li>
                    <li>Date of birth (if provided)</li>
                    <li>Gender (if provided)</li>
                    <li>Profile photograph</li>
                    <li>Government-issued ID numbers (for verification)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Data</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Email addresses</li>
                    <li>Phone numbers</li>
                    <li>Postal addresses</li>
                    <li>Delivery addresses</li>
                    <li>Emergency contact information</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Data</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Payment method information (encrypted)</li>
                    <li>Billing addresses</li>
                    <li>Transaction history</li>
                    <li>Credit/debit card details (tokenized)</li>
                    <li>M-Pesa transaction records</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Data</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>IP addresses and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Operating system</li>
                    <li>Cookies and tracking data</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Data</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Website and app usage patterns</li>
                    <li>Search queries and preferences</li>
                    <li>Purchase history and behavior</li>
                    <li>Product reviews and ratings</li>
                    <li>Customer service interactions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Legal Basis for Processing</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Contract Performance</h3>
                  <p className="text-green-800">Processing necessary to fulfill our contract with you, including order processing, delivery, and customer service.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Legitimate Interest</h3>
                  <p className="text-blue-800">Processing for fraud prevention, security, analytics, and business operations that don't override your rights.</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Consent</h3>
                  <p className="text-purple-800">Processing based on your explicit consent for marketing communications, cookies, and optional features.</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-orange-900 mb-2">Legal Obligation</h3>
                  <p className="text-orange-800">Processing required to comply with legal obligations, such as tax reporting and regulatory requirements.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Data Protection Rights</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right of Access</h3>
                  <p className="text-gray-700">Request a copy of all personal data we hold about you, including how it's being used.</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Rectification</h3>
                  <p className="text-gray-700">Request correction of inaccurate or incomplete personal data.</p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Erasure</h3>
                  <p className="text-gray-700">Request deletion of your personal data when it's no longer necessary or you withdraw consent.</p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Restrict Processing</h3>
                  <p className="text-gray-700">Request limitation of processing in certain circumstances.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Data Portability</h3>
                  <p className="text-gray-700">Receive your personal data in a structured, machine-readable format.</p>
                </div>

                <div className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Object</h3>
                  <p className="text-gray-700">Object to processing based on legitimate interests or for direct marketing.</p>
                </div>

                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Right to Withdraw Consent</h3>
                  <p className="text-gray-700">Withdraw consent at any time for consent-based processing.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security Measures</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Technical Safeguards</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                  <li><strong>Network Security:</strong> Firewalls, intrusion detection, and monitoring</li>
                  <li><strong>Regular Updates:</strong> Security patches and vulnerability assessments</li>
                  <li><strong>Backup Systems:</strong> Encrypted backups with disaster recovery plans</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Organizational Measures</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Staff Training:</strong> Regular data protection and security training</li>
                  <li><strong>Access Policies:</strong> Strict need-to-know access principles</li>
                  <li><strong>Incident Response:</strong> Comprehensive breach response procedures</li>
                  <li><strong>Vendor Management:</strong> Due diligence on all third-party processors</li>
                  <li><strong>Regular Audits:</strong> Internal and external security assessments</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Account Information</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Until account deletion</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Service provision</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Transaction Records</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">7 years</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Legal/tax requirements</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Marketing Data</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Until consent withdrawn</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Marketing purposes</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Website Analytics</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">26 months</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Business analytics</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Support Tickets</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3 years</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Service improvement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
              <div className="space-y-4 text-gray-700">
                <p>When we transfer your data outside Kenya or the EEA, we ensure adequate protection through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection</li>
                  <li><strong>Standard Contractual Clauses:</strong> EU-approved contract terms with processors</li>
                  <li><strong>Certification Schemes:</strong> Processors certified under recognized schemes</li>
                  <li><strong>Binding Corporate Rules:</strong> Internal data protection rules for group companies</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Breach Notification</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-900 mb-2">Our Commitment</h3>
                <ul className="list-disc pl-6 space-y-1 text-red-800">
                  <li>We'll notify supervisory authorities within 72 hours of becoming aware of a breach</li>
                  <li>We'll inform affected individuals without undue delay if there's high risk to their rights</li>
                  <li>We'll provide clear information about the breach and steps being taken</li>
                  <li>We'll document all breaches and our response measures</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exercising Your Rights</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">How to Submit Requests</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Online:</strong> Use our Privacy Dashboard in your account settings</li>
                  <li><strong>Email:</strong> Send requests to dpo@householdplanetkenya.co.ke</li>
                  <li><strong>Phone:</strong> Call +254 700 000 000 and ask for data protection</li>
                  <li><strong>Post:</strong> Write to our Data Protection Officer at our registered address</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Response Timeline</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>We'll acknowledge your request within 48 hours</li>
                  <li>We'll respond to most requests within 30 days</li>
                  <li>Complex requests may take up to 90 days (we'll explain why)</li>
                  <li>We may request additional information to verify your identity</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Complaints and Supervisory Authority</h2>
              <div className="space-y-4 text-gray-700">
                <p>If you're not satisfied with how we handle your personal data, you can:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact our Data Protection Officer directly</li>
                  <li>File a complaint with the Office of the Data Protection Commissioner (Kenya)</li>
                  <li>Contact your local supervisory authority if you're in the EU</li>
                  <li>Seek legal remedies through the courts</li>
                </ul>

                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Kenya Data Protection Commissioner</h4>
                  <ul className="list-none space-y-1 text-gray-700">
                    <li><strong>Website:</strong> www.odpc.go.ke</li>
                    <li><strong>Email:</strong> info@odpc.go.ke</li>
                    <li><strong>Phone:</strong> +254 20 2628 000</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Our Data Protection Officer</h2>
              <div className="space-y-2 text-gray-700">
                <p>For all data protection matters, contact our DPO:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> dpo@householdplanetkenya.co.ke</li>
                  <li><strong>Phone:</strong> +254 700 000 000</li>
                  <li><strong>Address:</strong> Data Protection Officer, Household Planet Kenya, Nairobi, Kenya</li>
                  <li><strong>Response Time:</strong> Within 48 hours for urgent matters</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
