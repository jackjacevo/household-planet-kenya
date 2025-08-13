'use client';

import { motion } from 'framer-motion';
import { FiMail, FiGift } from 'react-icons/fi';
import { useState } from 'react';
import Button from '../ui/Button';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-green-400 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to the Family!
            </h3>
            <p className="text-gray-600 mb-4">
              You&apos;ve successfully subscribed to our newsletter. Check your email for your 10% discount code!
            </p>
            <Button onClick={() => setIsSubscribed(false)} variant="outline">
              Subscribe Another Email
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl text-center border border-white/20"
        >
          <div className="flex items-center justify-center mb-6">
            <FiGift className="h-12 w-12 text-blue-600 mr-3" />
            <FiMail className="h-12 w-12 text-purple-600" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Get 10% Off Your First Order!
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, 
            and home improvement tips. Plus, get an instant 10% discount code!
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 whitespace-nowrap bg-white text-purple-600 hover:bg-white/90 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subscribing...
                  </div>
                ) : (
                  'Get Discount'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-white/80">
            <div className="flex items-center justify-center">
              <span className="text-green-400 mr-2 text-lg">✓</span>
              Exclusive deals & offers
            </div>
            <div className="flex items-center justify-center">
              <span className="text-green-400 mr-2 text-lg">✓</span>
              New product alerts
            </div>
            <div className="flex items-center justify-center">
              <span className="text-green-400 mr-2 text-lg">✓</span>
              Home improvement tips
            </div>
          </div>

          <p className="mt-8 text-sm text-white/60">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}