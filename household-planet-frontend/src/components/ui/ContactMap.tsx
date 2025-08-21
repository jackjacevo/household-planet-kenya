'use client';

import { motion } from 'framer-motion';
import GoogleMap from './GoogleMap';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';

export default function ContactMap() {
  // Nairobi coordinates (Moi Avenue area)
  const storeLocation = { lat: -1.2864, lng: 36.8172 };

  const mapMarkers = [
    {
      position: storeLocation,
      title: 'Household Planet Kenya',
      info: `
        <div style="padding: 12px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 16px;">Household Planet Kenya</h3>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            Iconic Business Plaza<br/>
            Basement Shop B10<br/>
            Moi Avenue, Nairobi
          </p>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #059669; font-size: 12px; font-weight: 500;">
              📞 +254 790 227 760<br/>
              🕒 Mon-Sat: 8AM-6PM
            </p>
          </div>
        </div>
      `
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Our <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Store</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Visit us at our convenient location in the heart of Nairobi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Store Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Store Location</h3>
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Address</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Iconic Business Plaza<br />
                    Basement Shop B10<br />
                    Moi Avenue, Nairobi
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Landmarks</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Near Kencom House<br />
                    Opposite Nation Centre<br />
                    Close to Moi Avenue Bus Stop
                  </p>
                </div>
              </div>
              <motion.a
                href="https://maps.google.com/?q=Iconic+Business+Plaza+Moi+Avenue+Nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Navigation className="h-5 w-5" />
                <span>Get Directions</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Interactive Google Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                <GoogleMap
                  center={storeLocation}
                  zoom={16}
                  markers={mapMarkers}
                  height="100%"
                  className="rounded-2xl"
                  title="Household Planet Kenya"
                  address="Iconic Business Plaza, Basement Shop B10, Moi Avenue, Nairobi"
                />
                
                {/* Map Overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-gray-900">Household Planet Kenya</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Opening Hours</h4>
            <p className="text-gray-600 text-sm">
              Mon-Sat: 8:00 AM - 6:00 PM<br />
              Sunday: 9:00 AM - 4:00 PM
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Call Before Visit</h4>
            <p className="text-gray-600 text-sm">
              +254 790 227 760<br />
              Confirm availability
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Easy Access</h4>
            <p className="text-gray-600 text-sm">
              Basement level<br />
              Elevator & stairs available
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}