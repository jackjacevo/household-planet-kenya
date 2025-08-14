'use client';

import { useState } from 'react';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'services', title: 'Description of Services' },
    { id: 'accounts', title: 'User Accounts' },
    { id: 'orders', title: 'Orders and Payments' },
    { id: 'shipping', title: 'Shipping and Delivery' },
    { id: 'returns', title: 'Returns and Refunds' },
    { id: 'intellectual', title: 'Intellectual Property' },
    { id: 'prohibited', title: 'Prohibited Uses' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact Information' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="mt-2 text-blue-100">
              Last updated: January 2025
            </p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Navigation */}
            <div className="lg:w-1/4 bg-gray-100 p-6">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:w-3/4 p-6">
              {activeSection === 'acceptance' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      By accessing and using the Household Planet Kenya website and services, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                    <p className="mb-4">
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                    <p className="mb-4">
                      These Terms of Service constitute a legally binding agreement between you and Household Planet Kenya regarding your use of our e-commerce platform.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'services' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">2. Description of Services</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      Household Planet Kenya operates an e-commerce platform that allows users to:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Browse and purchase household products</li>
                      <li>Create user accounts and manage profiles</li>
                      <li>Track orders and delivery status</li>
                      <li>Leave product reviews and ratings</li>
                      <li>Access customer support services</li>
                    </ul>
                    <p className="mb-4">
                      We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'accounts' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      To access certain features of our service, you must create an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and update your account information</li>
                      <li>Keep your password secure and confidential</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized use</li>
                    </ul>
                    <p className="mb-4">
                      We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">4. Orders and Payments</h2>
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Order Process</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li>All orders are subject to acceptance and availability</li>
                      <li>We reserve the right to refuse or cancel orders</li>
                      <li>Prices are subject to change without notice</li>
                      <li>Order confirmation does not guarantee product availability</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold mb-2">Payment Terms</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Payment is required at the time of order</li>
                      <li>We accept M-Pesa, credit cards, and bank transfers</li>
                      <li>All payments are processed securely</li>
                      <li>Failed payments may result in order cancellation</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'shipping' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">5. Shipping and Delivery</h2>
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Delivery Areas</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Nairobi: Same-day and next-day delivery available</li>
                      <li>Major cities: 2-3 business days</li>
                      <li>Rural areas: 3-5 business days</li>
                      <li>Remote locations: 5-7 business days</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold mb-2">Shipping Costs</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Free shipping on orders over KES 5,000</li>
                      <li>Standard shipping: KES 200-500 depending on location</li>
                      <li>Express shipping: KES 500-1,000</li>
                      <li>Shipping costs calculated at checkout</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'returns' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">6. Returns and Refunds</h2>
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Return Policy</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li>30-day return period from delivery date</li>
                      <li>Items must be in original condition and packaging</li>
                      <li>Return authorization required before sending items</li>
                      <li>Customer responsible for return shipping costs</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold mb-2">Refund Process</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Refunds processed within 5-7 business days</li>
                      <li>Refunds issued to original payment method</li>
                      <li>Shipping costs are non-refundable</li>
                      <li>Damaged or defective items eligible for full refund</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'intellectual' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Household Planet Kenya and is protected by copyright and other intellectual property laws.
                    </p>
                    <p className="mb-4">
                      You may not reproduce, distribute, modify, or create derivative works of our content without explicit written permission.
                    </p>
                    <p className="mb-4">
                      User-generated content (reviews, comments) remains your property, but you grant us a license to use, display, and distribute such content on our platform.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'prohibited' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">8. Prohibited Uses</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">You agree not to use our services for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the service:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>For fraudulent purposes or in connection with a criminal offense</li>
                      <li>To send, use or reuse any material that is illegal, offensive, abusive, or harmful</li>
                      <li>To transmit or procure the sending of any unsolicited or unauthorized advertising</li>
                      <li>To impersonate any person or entity or misrepresent your affiliation</li>
                      <li>To interfere with or disrupt the service or servers</li>
                      <li>To attempt to gain unauthorized access to any part of the service</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'liability' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      Household Planet Kenya shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                    <p className="mb-4">
                      Our total liability to you for all claims arising from or relating to the service shall not exceed the amount you paid us in the twelve months preceding the claim.
                    </p>
                    <p className="mb-4">
                      We do not warrant that the service will be uninterrupted, secure, or error-free, or that defects will be corrected.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'governing' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">10. Governing Law</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Kenya.
                    </p>
                    <p className="mb-4">
                      Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
                    </p>
                    <p className="mb-4">
                      If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'changes' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website.
                    </p>
                    <p className="mb-4">
                      Your continued use of the service after any changes constitutes acceptance of the new terms.
                    </p>
                    <p className="mb-4">
                      We will notify users of significant changes via email or prominent notice on our website.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'contact' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p><strong>Household Planet Kenya</strong></p>
                      <p>Email: legal@householdplanet.co.ke</p>
                      <p>Phone: +254 700 000 000</p>
                      <p>Address: Nairobi, Kenya</p>
                    </div>
                    <p className="mt-4">
                      For general inquiries: support@householdplanet.co.ke
                    </p>
                    <p>
                      For privacy matters: privacy@householdplanet.co.ke
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}