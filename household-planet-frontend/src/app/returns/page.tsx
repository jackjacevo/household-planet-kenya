'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Clock, CheckCircle, XCircle, Phone, Mail, MessageCircle } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Return <span className="text-orange-600">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Easy returns within 7 days for your peace of mind
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Return Window */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Return Window</h2>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-semibold text-lg">
                📅 You have 7 days from delivery date to return items
              </p>
              <p className="text-orange-700 mt-2">
                Returns must be initiated within this period. Items returned after 7 days will not be accepted.
              </p>
            </div>
          </motion.section>

          {/* Eligible Items */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">What Can Be Returned</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-800 mb-3">✅ Eligible Items</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Items in original packaging
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Unused and undamaged products
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Items with all original tags/labels
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Products in resalable condition
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Items with receipt or order number
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-3">❌ Non-Returnable Items</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Personal care items (hygiene products)
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Food items and consumables
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Custom or personalized items
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Items damaged by misuse
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    Items without original packaging
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Return Process */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <RotateCcw className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">How to Return Items</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Customer Service</h3>
                  <p className="text-gray-700">
                    Call us at <a href="tel:+254790227760" className="text-orange-600 font-medium">+254 790 227 760</a> or 
                    WhatsApp us to initiate your return. Provide your order number and reason for return.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Get Return Authorization</h3>
                  <p className="text-gray-700">
                    Our team will review your request and provide return instructions if approved. You'll receive a return authorization number.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Package & Send</h3>
                  <p className="text-gray-700">
                    Pack items securely in original packaging. Include the return authorization number. We'll arrange pickup or provide return address.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Inspection & Refund</h3>
                  <p className="text-gray-700">
                    Once we receive and inspect your return, we'll process your refund within 3-5 business days via M-Pesa or original payment method.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Return Costs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <XCircle className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Return Costs & Refunds</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Free Returns</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• Defective or damaged items</li>
                  <li>• Wrong item sent</li>
                  <li>• Items not as described</li>
                  <li>• Our error in fulfillment</li>
                </ul>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">💰 Customer Pays Return Cost</h3>
                <ul className="text-orange-700 space-y-1">
                  <li>• Change of mind returns</li>
                  <li>• Wrong size/color ordered</li>
                  <li>• No longer needed</li>
                  <li>• Return cost: KSh 200-500</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Refund Timeline:</strong> 3-5 business days after inspection. Refunds processed via M-Pesa (instant) or original payment method.
              </p>
            </div>
          </motion.section>

          {/* Exchanges */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <RotateCcw className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Exchanges</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                We offer exchanges for size, color, or model changes within the 7-day return window.
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-800 mb-2">Exchange Process:</h3>
                <ol className="text-indigo-700 space-y-1">
                  <li>1. Contact customer service to request exchange</li>
                  <li>2. Return original item following return process</li>
                  <li>3. Place new order for desired item</li>
                  <li>4. Pay any price difference or receive refund</li>
                </ol>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Exchanges are subject to stock availability. If desired item is unavailable, full refund will be processed.
              </p>
            </div>
          </motion.section>

          {/* Contact for Returns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need to Return Something?</h2>
              <p className="text-gray-700">
                Contact our customer service team to start your return process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Phone className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                <a href="tel:+254790227760" className="text-orange-600 font-medium hover:text-orange-700">
                  +254 790 227 760
                </a>
                <p className="text-xs text-gray-500 mt-1">Mon-Sat 8AM-6PM</p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                <a href="https://wa.me/254790227760" className="text-green-600 font-medium hover:text-green-700">
                  Chat with us
                </a>
                <p className="text-xs text-gray-500 mt-1">Quick responses</p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                <a href="mailto:householdplanet819@gmail.com" className="text-blue-600 font-medium hover:text-blue-700">
                  Send Email
                </a>
                <p className="text-xs text-gray-500 mt-1">24hr response</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}