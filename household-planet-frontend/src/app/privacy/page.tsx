'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Lock, UserCheck, Database, Phone } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy <span className="text-orange-600">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            How we collect, use, and protect your personal information
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: January 2025</p>
        </motion.div>

        <div className="space-y-8">
          {/* Information We Collect */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Name, email address, and phone number</li>
                  <li>• Delivery address and billing information</li>
                  <li>• Payment information (processed securely)</li>
                  <li>• Order history and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Automatically Collected</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Device information and IP address</li>
                  <li>• Browser type and operating system</li>
                  <li>• Pages visited and time spent on site</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* How We Use Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-800 mb-3">✅ We Use Your Data To:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Process and fulfill your orders
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Send order confirmations and updates
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Provide customer support
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Improve our website and services
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Send promotional offers (with consent)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-3">❌ We Never:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Sell your personal information
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Share data with unauthorized parties
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Send spam or unwanted messages
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Store payment card details
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Use data for unauthorized purposes
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Data Security */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🔒 Technical Safeguards</h3>
                  <ul className="text-purple-700 space-y-1">
                    <li>• SSL encryption for data transmission</li>
                    <li>• Secure servers and databases</li>
                    <li>• Regular security updates</li>
                    <li>• Access controls and monitoring</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">👥 Administrative Safeguards</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Limited employee access</li>
                    <li>• Staff training on data protection</li>
                    <li>• Regular security audits</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Information Sharing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                We may share your information only in these limited circumstances:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🚚 Service Providers</h3>
                  <p className="text-gray-700">Delivery companies and payment processors to fulfill orders</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">⚖️ Legal Requirements</h3>
                  <p className="text-gray-700">When required by law or to protect our rights and safety</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">✅ With Your Consent</h3>
                  <p className="text-gray-700">When you explicitly agree to share information with third parties</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Your Rights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-orange-800 mb-3">📋 Data Rights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Access your personal data
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Correct inaccurate information
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Delete your account and data
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Export your data
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 mb-3">📧 Communication Rights</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Opt out of marketing emails
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Unsubscribe from SMS notifications
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Control cookie preferences
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    Request communication preferences
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800">
                <strong>To exercise your rights:</strong> Contact us at householdplanet819@gmail.com or +254 790 227 760
              </p>
            </div>
          </motion.section>

          {/* Cookies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Cookies & Tracking</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to improve your experience:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-1">Essential</h3>
                  <p className="text-sm text-yellow-700">Required for site functionality</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-1">Analytics</h3>
                  <p className="text-sm text-blue-700">Help us improve our website</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-1">Marketing</h3>
                  <p className="text-sm text-green-700">Personalized content (optional)</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                You can control cookie settings through your browser preferences or our cookie banner.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
              <p className="text-gray-700">
                Contact us if you have any questions about this privacy policy or how we handle your data
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Phone className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                <a href="tel:+254790227760" className="text-orange-600 font-medium hover:text-orange-700">
                  +254 790 227 760
                </a>
                <p className="text-xs text-gray-500 mt-1">Mon-Sat 8AM-6PM</p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                <a href="mailto:householdplanet819@gmail.com" className="text-blue-600 font-medium hover:text-blue-700">
                  householdplanet819@gmail.com
                </a>
                <p className="text-xs text-gray-500 mt-1">Privacy inquiries</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                <strong>Business Address:</strong> Moi Avenue, Iconic Business Plaza, Basement Shop B10, Nairobi
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
