'use client';

import { motion } from 'framer-motion';
import { FileText, ShoppingCart, CreditCard, Truck, Shield, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of <span className="text-orange-600">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Terms and conditions for using Household Planet Kenya services
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2025</p>
        </motion.div>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                By accessing and using the Household Planet Kenya website and services, you accept and agree to be bound by these Terms of Service.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Important:</strong> If you do not agree to these terms, please do not use our website or services.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">About Household Planet Kenya</h3>
                <p className="text-gray-700">
                  We are an e-commerce platform operating in Kenya, providing household items and related services. 
                  Our business is located at Moi Avenue, Iconic Business Plaza, Basement Shop B10, Nairobi.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Use of Website */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Use of Website</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-800 mb-3">✅ Permitted Uses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Browse and purchase products
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Create and manage your account
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Contact customer service
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Leave product reviews
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Share content on social media
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-3">❌ Prohibited Uses</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Fraudulent or illegal activities
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Hacking or unauthorized access
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Spam or malicious content
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Copying or reproducing content
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Interfering with website operation
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Orders and Payments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Orders & Payments</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🛒 Order Terms</h3>
                  <ul className="text-purple-700 space-y-1">
                    <li>• Orders subject to availability</li>
                    <li>• Prices may change without notice</li>
                    <li>• Minimum order requirements may apply</li>
                    <li>• Order confirmation required</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">💳 Payment Terms</h3>
                  <ul className="text-green-700 space-y-1">
                    <li>• Payment required before delivery</li>
                    <li>• M-Pesa, bank transfer, or COD</li>
                    <li>• COD fees may apply</li>
                    <li>• Secure payment processing</li>
                  </ul>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">⚠️ Important Notes</h3>
                <ul className="text-orange-700 space-y-1">
                  <li>• We reserve the right to cancel orders for any reason</li>
                  <li>• Product images are for illustration purposes only</li>
                  <li>• Actual products may vary slightly from images</li>
                  <li>• All prices are in Kenyan Shillings (KSh)</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Delivery Terms */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Delivery Terms</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">📦 Delivery Policy</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Delivery within Kenya only</li>
                    <li>• Timeframes are estimates, not guarantees</li>
                    <li>• Someone must be available to receive delivery</li>
                    <li>• Valid ID required for COD orders</li>
                    <li>• Delivery charges based on location tiers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">🚚 Delivery Charges</h3>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Tier 1: KSh 100-200 (CBD, Kajiado)</li>
                    <li>• Tier 2: KSh 250-300 (Westlands, Kilimani)</li>
                    <li>• Tier 3: KSh 350-650 (Karen, Mombasa)</li>
                    <li>• Tier 4: KSh 550-1,000 (JKIA, Remote)</li>
                    <li>• Free delivery on orders above KSh 5,000</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Risk of Loss:</strong> Risk of loss and title for products pass to you upon delivery to the specified address.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Returns and Refunds */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Returns & Refunds</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-2">↩️ Return Policy</h3>
                  <ul className="text-indigo-700 space-y-1">
                    <li>• 7-day return window from delivery</li>
                    <li>• Items must be unused and in original packaging</li>
                    <li>• Return authorization required</li>
                    <li>• Customer pays return shipping (unless our error)</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">💰 Refund Policy</h3>
                  <ul className="text-green-700 space-y-1">
                    <li>• Refunds processed within 3-5 business days</li>
                    <li>• Refunded to original payment method</li>
                    <li>• M-Pesa refunds are instant</li>
                    <li>• Inspection required before refund</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-700">
                For detailed return procedures, please refer to our <a href="/returns" className="text-orange-600 hover:text-orange-700 underline">Return Policy</a> page.
              </p>
            </div>
          </motion.section>

          {/* Limitation of Liability */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Disclaimer</h3>
                <p className="text-yellow-700">
                  Our website and services are provided "as is" without warranties of any kind. We make no guarantees about the accuracy, reliability, or availability of our services.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Liability Limitations:</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• We are not liable for indirect, incidental, or consequential damages</li>
                  <li>• Our total liability is limited to the amount you paid for the specific product</li>
                  <li>• We are not responsible for delays caused by circumstances beyond our control</li>
                  <li>• Product warranties are provided by manufacturers, not by us</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Governing Law */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-gray-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Governing Law & Disputes</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">⚖️ Governing Law</h3>
                  <p className="text-gray-700">
                    These terms are governed by the laws of Kenya. Any disputes will be resolved in Kenyan courts.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🤝 Dispute Resolution</h3>
                  <p className="text-gray-700">
                    We encourage resolving disputes through direct communication before legal action.
                  </p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">📞 Contact for Disputes</h3>
                <p className="text-orange-700">
                  Email: householdplanet819@gmail.com | Phone: +254 790 227 760
                </p>
              </div>
            </div>
          </motion.section>

          {/* Changes to Terms */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Changes to Terms</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800">
                  <strong>Your Responsibility:</strong> It is your responsibility to review these terms periodically. Continued use of our services constitutes acceptance of any changes.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
              <p className="text-gray-700">
                Contact us if you have any questions about these Terms of Service
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">📧 Email</h3>
                <a href="mailto:householdplanet819@gmail.com" className="text-orange-600 font-medium hover:text-orange-700">
                  householdplanet819@gmail.com
                </a>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">📞 Phone</h3>
                <a href="tel:+254790227760" className="text-orange-600 font-medium hover:text-orange-700">
                  +254 790 227 760
                </a>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">📍 Address</h3>
                <p className="text-gray-700 text-sm">
                  Moi Avenue, Iconic Business Plaza, Basement Shop B10, Nairobi
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
