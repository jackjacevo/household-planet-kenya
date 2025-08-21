'use client';

import { motion } from 'framer-motion';
import { Star, Users, CheckCircle, ThumbsUp } from 'lucide-react';

export function TrustBadges() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Stats Section - Focus on social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-green-600 rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-green-100 max-w-2xl mx-auto">
              Join our growing community of satisfied customers across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 mr-2" />
                <div className="text-3xl font-bold">10,000+</div>
              </div>
              <div className="text-green-100">Happy Customers</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-2">
                <Star className="w-8 h-8 mr-2" />
                <div className="text-3xl font-bold">4.9</div>
              </div>
              <div className="text-green-100">Average Rating</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 mr-2" />
                <div className="text-3xl font-bold">99%</div>
              </div>
              <div className="text-green-100">Satisfaction Rate</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-2">
                <ThumbsUp className="w-8 h-8 mr-2" />
                <div className="text-3xl font-bold">5,000+</div>
              </div>
              <div className="text-green-100">5-Star Reviews</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}