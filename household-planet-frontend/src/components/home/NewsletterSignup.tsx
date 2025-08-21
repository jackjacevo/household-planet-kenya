'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Gift, ArrowRight, CheckCircle, Shield, Bell } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  const benefits = [
    { icon: Gift, text: '10% OFF first order' },
    { icon: Bell, text: 'Exclusive deals & flash sales' },
    { icon: Mail, text: 'Home styling tips & trends' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 animate-float">
          <Mail className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float delay-1000">
          <Gift className="w-10 h-10" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Discount Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-green-800 px-6 py-3 rounded-full text-lg font-bold mb-6 animate-bounce">
              <Gift className="w-5 h-5" />
              Get 10% OFF Your First Order!
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Stay Updated with <span className="text-yellow-300">Household Planet</span>
            </h2>
            
            <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8 leading-relaxed">
              Subscribe now and get <span className="text-yellow-300 font-semibold">10% discount</span> on your first purchase! 
              Plus receive styling tips, exclusive deals, and early access to new arrivals.
            </p>
            
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4"
                >
                  <benefit.icon className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col sm:flex-row gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-300" />
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-green-200 focus:outline-none text-lg"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="group bg-white hover:bg-green-50 text-green-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    Get 10% OFF
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/30"
              >
                <CheckCircle className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Welcome to the Family!</h3>
                <p className="text-green-100 mb-4">
                  Thank you for subscribing! Check your email for your 10% discount code.
                </p>
                <div className="bg-yellow-400 text-green-800 px-4 py-2 rounded-lg font-bold text-lg">
                  Discount Code: WELCOME10
                </div>
              </motion.div>
            )}
            
            {/* Privacy Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-2 mt-6 text-sm text-green-200"
            >
              <Shield className="w-4 h-4" />
              <span>We respect your privacy. Unsubscribe at any time.</span>
            </motion.div>
          </motion.div>
          
          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-green-200 mb-4">Join 15,000+ subscribers saving money on home essentials</p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-300" />
                <span>Instant 10% discount</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-300" />
                <span>Exclusive member deals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-300" />
                <span>Early sale access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}