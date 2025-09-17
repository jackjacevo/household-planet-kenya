'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Shield, Package, CreditCard } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shipping <span className="text-orange-600">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fast, reliable delivery across Kenya with transparent pricing and tracking
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Delivery Times */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Delivery Timeframes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Nairobi Areas</h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">1 Day</p>
                <p className="text-gray-600">CBD, Westlands, Kilimani</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Nearby Towns</h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">2-3 Days</p>
                <p className="text-gray-600">Thika, Machakos, Kiambu</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Upcountry</h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">3-5 Days</p>
                <p className="text-gray-600">Mombasa, Kisumu, Eldoret</p>
              </div>
            </div>
          </motion.section>

          {/* Shipping Costs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Delivery Areas & Shipping Costs</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tier 1 Locations */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">Tier 1 (KSh 100-200)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Nairobi CBD</span><span className="font-medium">KSh 100</span></div>
                  <div className="flex justify-between"><span>Kajiado (Naekana)</span><span className="font-medium">KSh 150</span></div>
                  <div className="flex justify-between"><span>Kitengela (Via Shuttle)</span><span className="font-medium">KSh 150</span></div>
                  <div className="flex justify-between"><span>Thika (Super Metrol)</span><span className="font-medium">KSh 150</span></div>
                  <div className="flex justify-between"><span>Juja (Via Super Metrol)</span><span className="font-medium">KSh 200</span></div>
                  <div className="flex justify-between"><span>Kikuyu Town</span><span className="font-medium">KSh 200</span></div>
                </div>
              </div>

              {/* Tier 2 Locations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Tier 2 (KSh 250-300)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Pangani</span><span className="font-medium">KSh 250</span></div>
                  <div className="flex justify-between"><span>Upperhill</span><span className="font-medium">KSh 250</span></div>
                  <div className="flex justify-between"><span>Bomet (Easycoach)</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Eastleigh</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Hurlingham</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Industrial Area</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Kileleshwa</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Kilimani</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Machakos</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Madaraka</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Makadara</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Mbagathi Way</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Mpaka Road</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Naivasha (Via NNUS)</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Nanyuki</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Parklands</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Riverside</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>South B</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>South C</span><span className="font-medium">KSh 300</span></div>
                  <div className="flex justify-between"><span>Westlands</span><span className="font-medium">KSh 300</span></div>
                </div>
              </div>

              {/* Tier 3 Locations */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-3">Tier 3 (KSh 350-650)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>ABC (Waiyaki Way)</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Allsops, Ruaraka</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Bungoma</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Carnivore (Langata)</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>DCI (Kiambu Rd)</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Eldoret</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Embu</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Homa Bay</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Imara Daima</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Jamhuri Estate</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Kericho</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Kisii</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Kisumu</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Kitale</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Lavington</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Mombasa</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Nextgen Mall</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Roasters</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Rongo</span><span className="font-medium">KSh 350</span></div>
                  <div className="flex justify-between"><span>Buruburu</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Donholm</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Kangemi</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Kasarani</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Kitisuru</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Lucky Summer</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Lumumba Drive</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Muthaiga</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Peponi Road</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Roysambu</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Thigiri</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Village Market</span><span className="font-medium">KSh 400</span></div>
                  <div className="flex justify-between"><span>Karen</span><span className="font-medium">KSh 650</span></div>
                  <div className="flex justify-between"><span>Kiambu</span><span className="font-medium">KSh 650</span></div>
                </div>
              </div>

              {/* Tier 4 Locations */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:col-span-2 lg:col-span-1">
                <h3 className="font-semibold text-red-800 mb-3">Tier 4 (KSh 550-1,000)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Kahawa Sukari</span><span className="font-medium">KSh 550</span></div>
                  <div className="flex justify-between"><span>Kahawa Wendani</span><span className="font-medium">KSh 550</span></div>
                  <div className="flex justify-between"><span>JKIA</span><span className="font-medium">KSh 700</span></div>
                  <div className="flex justify-between"><span>Ngong Town</span><span className="font-medium">KSh 1,000</span></div>
                </div>
              </div>
            </div>

          </motion.section>

          {/* Order Processing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Order Processing</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Order Confirmation</h3>
                  <p className="text-gray-700">Orders are processed within 2-4 hours during business hours (Mon-Sat, 8AM-6PM)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Packaging</h3>
                  <p className="text-gray-700">Items are carefully packaged to ensure safe delivery</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dispatch & Tracking</h3>
                  <p className="text-gray-700">You'll receive SMS and email notifications with tracking information</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Delivery Terms */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Delivery Terms</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Someone must be available to receive the delivery during business hours
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Valid ID required for cash on delivery orders
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Delivery attempts are made twice before returning to warehouse
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Additional charges apply for failed delivery attempts
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                Inspect items upon delivery and report any damage immediately
              </li>
            </ul>
          </motion.section>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Shipping?</h2>
            <p className="text-gray-700 mb-4">
              Contact our customer service team for shipping inquiries or special delivery arrangements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+254700000000" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Call: +254 700 000 000
              </a>
              <a href="https://wa.me/254700000000" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
