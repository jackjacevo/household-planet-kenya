'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, Clock, Phone, CheckCircle, Award } from 'lucide-react';

const values = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free delivery on orders over Ksh 2,000 across Kenya',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    stat: '5,000+'
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: '100% authentic products with 1-year warranty',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    stat: '100%'
  },
  {
    icon: Clock,
    title: 'Fast Shipping',
    description: '2-5 business days delivery nationwide',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    stat: '2-5 Days'
  },
  {
    icon: Phone,
    title: '24/7 Support',
    description: 'Customer support via WhatsApp & phone',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    stat: '24/7'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7
    }
  }
};

export function ValuePropositions() {
  return (
    <section className="py-12 sm:py-20 bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-green-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Award className="w-3 h-3 sm:w-4 sm:h-4" />
            Why Choose Us
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Your <span className="text-green-600">Satisfaction</span> is Our Priority
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Experience premium service with every purchase. We're committed to making your home transformation journey seamless.
          </p>
        </motion.div>
        
        {/* Values Grid - Better Balanced Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden h-full">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-br ${value.color} rounded-full transform translate-x-6 -translate-y-6`} />
                </div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Stat Badge */}
                  <div className="absolute -top-2 -right-2 bg-white border-2 border-gray-100 rounded-full px-2 py-1 text-xs font-bold text-gray-700 shadow-sm">
                    {value.stat}
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {value.description}
                  </p>
                </div>
                
                {/* Check Icon */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gray-200/50 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6 text-lg">
            Join thousands of satisfied customers across Kenya
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>10,000+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>5-Star Rated Service</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Trusted Since 2020</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
