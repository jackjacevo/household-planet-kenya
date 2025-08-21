import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Household Planet Kenya',
  description: 'Comprehensive privacy policy detailing how we collect, use, and protect your personal information in compliance with GDPR and Kenya Data Protection Act.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">Quick Links to Legal Documents</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Link href="/legal/terms" className="text-blue-700 hover:text-blue-900 font-medium">Terms of Service</Link>
                  <br />
                  <Link href="/legal/cookies" className="text-blue-700 hover:text-blue-900 font-medium">Cookie Policy</Link>
                  <br />
                  <Link href="/legal/data-protection" className="text-blue-700 hover:text-blue-900 font-medium">Data Protection Agreement</Link>
                </div>
                <div>
                  <Link href="/legal/returns" className="text-blue-700 hover:text-blue-900 font-medium">Return & Refund Policy</Link>
                  <br />
                  <Link href="/legal/shipping" className="text-blue-700 hover:text-blue-900 font-medium">Shipping & Delivery Policy</Link>
                  <br />
                  <Link href="/legal/acceptable-use" className="text-blue-700 hover:text-blue-900 font-medium">Acceptable Use Policy</Link>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Household Planet Kenya ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our e-commerce platform, mobile application, and related services.
              </p>
              <p className="text-gray-700 mb-4">
                This policy complies with the General Data Protection Regulation (GDPR), Kenya's Data Protection Act, and other applicable privacy laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information You Provide</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Name, email address, and phone number</li>
                    <li>Delivery and billing addresses</li>
                    <li>Date of birth (optional, for age verification)</li>
                    <li>Payment information (processed securely by our payment partners)</li>
                    <li>Account credentials and security questions</li>
                    <li>Product reviews, ratings, and feedback</li>
                    <li>Customer service communications</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Device information (type, model, operating system)</li>
                    <li>Browser type, version, and language settings</li>
                    <li>IP address and approximate location</li>
                    <li>Website usage patterns and navigation data</li>
                    <li>Cookies, web beacons, and similar technologies</li>
                    <li>Referral sources and search terms</li>
                    <li>Time stamps and session duration</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Information from Third Parties</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Social media profile information (when you connect accounts)</li>
                    <li>Payment processor transaction data</li>
                    <li>Delivery partner tracking information</li>
                    <li>Marketing partner data (with your consent)</li>
                    <li>Fraud prevention service data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Essential Services</h3>
                  <ul className="list-disc pl-6 space-y-1 text-green-800">
                    <li>Process and fulfill your orders</li>
                    <li>Handle payments and prevent fraud</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Send order confirmations and delivery updates</li>
                    <li>Manage your account and preferences</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Service Improvement</h3>
                  <ul className="list-disc pl-6 space-y-1 text-blue-800">
                    <li>Analyze usage patterns to improve our platform</li>
                    <li>Personalize your shopping experience</li>
                    <li>Develop new features and services</li>
                    <li>Conduct research and analytics</li>
                    <li>Test and optimize our website performance</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Marketing (With Your Consent)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-purple-800">
                    <li>Send promotional emails and newsletters</li>
                    <li>Show personalized advertisements</li>
                    <li>Notify you about special offers and new products</li>
                    <li>Conduct surveys and market research</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-orange-900 mb-2">Legal and Security</h3>
                  <ul className="list-disc pl-6 space-y-1 text-orange-800">
                    <li>Comply with legal obligations and regulations</li>
                    <li>Prevent fraud, abuse, and security threats</li>
                    <li>Enforce our terms of service and policies</li>
                    <li>Respond to legal requests and court orders</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <div className="space-y-4 text-gray-700">
                <p>We process your personal data based on the following legal grounds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contract Performance:</strong> Processing necessary to fulfill our contract with you</li>
                  <li><strong>Legitimate Interest:</strong> Processing for fraud prevention, security, and business operations</li>
                  <li><strong>Consent:</strong> Processing based on your explicit consent (marketing, cookies)</li>
                  <li><strong>Legal Obligation:</strong> Processing required by law (tax records, regulatory compliance)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Privacy Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>Under GDPR and Kenya's Data Protection Act, you have the following rights:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Access & Portability</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Request a copy of your personal data</li>
                      <li>Receive data in a portable format</li>
                      <li>Understand how your data is processed</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Control & Correction</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Correct inaccurate or incomplete data</li>
                      <li>Request deletion of your data</li>
                      <li>Restrict or object to processing</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Consent Management</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Withdraw consent at any time</li>
                      <li>Opt out of marketing communications</li>
                      <li>Manage cookie preferences</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Complaints</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>File complaints with supervisory authorities</li>
                      <li>Seek legal remedies</li>
                      <li>Contact our Data Protection Officer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> Payment processors, delivery partners, cloud hosting services</li>
                  <li><strong>Business Partners:</strong> Marketing partners (with your consent), analytics providers</li>
                  <li><strong>Legal Requirements:</strong> Government authorities, law enforcement (when required by law)</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                </ul>
                <p className="mt-4">
                  <strong>We never sell your personal data to third parties for their marketing purposes.</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement comprehensive security measures including:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Technical Safeguards</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>End-to-end encryption (TLS 1.3)</li>
                      <li>Data encryption at rest (AES-256)</li>
                      <li>Multi-factor authentication</li>
                      <li>Regular security audits</li>
                      <li>Intrusion detection systems</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Organizational Measures</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Employee training programs</li>
                      <li>Access control policies</li>
                      <li>Incident response procedures</li>
                      <li>Regular risk assessments</li>
                      <li>Vendor security requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                When we transfer your data outside Kenya or the EEA, we ensure adequate protection through approved mechanisms such as Standard Contractual Clauses, adequacy decisions, or certification schemes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law. Account data is kept until deletion, transaction records for 7 years, and marketing data until consent is withdrawn.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for children under 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We'll notify you of significant changes via email or prominent notice on our website. Your continued use of our services constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For privacy-related questions or to exercise your rights:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">General Privacy Inquiries</h3>
                    <ul className="list-none space-y-1 text-sm">
                      <li><strong>Email:</strong> privacy@householdplanet.co.ke</li>
                      <li><strong>Phone:</strong> +254 700 000 000</li>
                      <li><strong>Response Time:</strong> Within 48 hours</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Data Protection Officer</h3>
                    <ul className="list-none space-y-1 text-sm">
                      <li><strong>Email:</strong> dpo@householdplanet.co.ke</li>
                      <li><strong>Address:</strong> Nairobi, Kenya</li>
                      <li><strong>For:</strong> GDPR requests, complaints</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}