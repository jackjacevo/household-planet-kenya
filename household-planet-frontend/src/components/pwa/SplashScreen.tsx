'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="bg-white rounded-full p-6 mb-4 mx-auto w-20 h-20 flex items-center justify-center"
        >
          <ShoppingBag className="h-8 w-8 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">Household Planet Kenya</h1>
        <p className="text-green-100">Loading your shopping experience...</p>
      </motion.div>
    </div>
  );
}
