'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, CreditCard, Headphones } from 'lucide-react';
import { useDelivery } from '@/hooks/useDelivery';

const staticFeatures = [
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'Premium quality products with 1-year warranty',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Pay via M-Pesa, card or cash on delivery',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Call or WhatsApp +254790 227 760',
    color: 'from-orange-500 to-red-500'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
};

export function FeaturesSection() {
  const { minDeliveryPrice, freeDeliveryThreshold, tier1Locations, loading } = useDelivery();

  // Create dynamic delivery feature based on real data
  const deliveryFeature = {
    icon: Truck,
    title: loading ? 'Kenya Delivery' : `Delivery from Ksh ${minDeliveryPrice}`,
    description: loading 
      ? 'Loading delivery information...' 
      : 'We deliver all over the country at different fees',
    color: 'from-green-500 to-emerald-500'
  };

  const features = [deliveryFeature, ...staticFeatures];

  return (
    <section className="py-16 bg-gradient-to-br from-white via-gray-50/50 to-green-50/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-green-600">Household Planet</span>?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Experience the difference with our premium service and quality commitment
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={`${feature.title}-${index}`}
              variants={itemVariants}
              className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 h-full"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Floating Animation */}
                <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl opacity-20 group-hover:animate-ping`} />
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gray-200/50 transition-colors duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}