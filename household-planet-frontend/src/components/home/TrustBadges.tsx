'use client';

import { motion } from 'framer-motion';
import { Star, Users, CheckCircle, ThumbsUp } from 'lucide-react';

export function TrustBadges() {
  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Stats Section - Focus on social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-green-600 rounded-2xl p-6 sm:p-8 text-white"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Trusted by Thousands</h2>
            <p className="text-green-100 max-w-2xl mx-auto text-sm sm:text-base">
              Join our growing community of satisfied customers across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
                <div className="text-2xl sm:text-3xl font-bold">10K+</div>
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Happy Customers</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
                <div className="text-2xl sm:text-3xl font-bold">4.9</div>
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Rating</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
                <div className="text-2xl sm:text-3xl font-bold">99%</div>
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Satisfaction</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-2">
                <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
                <div className="text-2xl sm:text-3xl font-bold">5K+</div>
              </div>
              <div className="text-green-100 text-xs sm:text-sm">Reviews</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}