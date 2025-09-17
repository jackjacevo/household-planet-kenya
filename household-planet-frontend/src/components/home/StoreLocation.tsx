'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';

export function StoreLocation() {

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Visit Our Store</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Find Us in <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Nairobi</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Visit our showroom to see and feel our quality products in person
            </p>
          </motion.div>

          {/* Store Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Our Address</h3>
              <p className="text-gray-600 text-sm">Iconic Business Plaza, Basement Shop B10, Moi Avenue</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600 text-sm">Mon-Sat: 8:00 AM - 6:00 PM</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm">+254 790 227 760</p>
            </div>
          </motion.div>

          {/* Google Map - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 overflow-hidden">
              <div className="relative w-full h-96 lg:h-[500px] rounded-xl overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Moi+Avenue,+Nairobi,+Kenya&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                  title="Household Planet Kenya Store Location"
                />
                
                {/* Map Overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-gray-900">Household Planet Kenya</span>
                  </div>
                </div>
              </div>
              
              {/* Get Directions Button */}
              <div className="mt-4 text-center">
                <motion.a
                  href="https://maps.google.com/?q=Iconic+Business+Plaza+Moi+Avenue+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Navigation className="h-5 w-5" />
                  <span>Get Directions</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
