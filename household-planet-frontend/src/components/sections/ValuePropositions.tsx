'use client';

import { motion } from 'framer-motion';
import { 
  FiTruck, 
  FiShield, 
  FiPhone, 
  FiDollarSign,
  FiClock,
  FiHeart
} from 'react-icons/fi';

const propositions = [
  {
    icon: FiTruck,
    title: 'Free Delivery',
    description: 'Free delivery on orders above KSh 5,000 within Nairobi. Affordable rates countrywide.',
    highlight: 'Orders above KSh 5,000'
  },
  {
    icon: FiShield,
    title: 'Quality Guarantee',
    description: '100% authentic products with quality assurance. 30-day return policy on all items.',
    highlight: '30-day returns'
  },
  {
    icon: FiPhone,
    title: '24/7 Customer Support',
    description: 'Dedicated customer service team available round the clock via phone, WhatsApp, and email.',
    highlight: 'Always available'
  },
  {
    icon: FiDollarSign,
    title: 'Best Prices',
    description: 'Competitive pricing with regular discounts and special offers for loyal customers.',
    highlight: 'Price match guarantee'
  },
  {
    icon: FiClock,
    title: 'Fast Processing',
    description: 'Orders processed within 24 hours. Same-day delivery available in selected areas.',
    highlight: 'Same-day delivery'
  },
  {
    icon: FiHeart,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We go the extra mile to ensure you love your purchase.',
    highlight: '98% satisfaction rate'
  }
];

export default function ValuePropositions() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Why Choose Household Planet Kenya?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We&apos;re committed to providing exceptional service and value
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propositions.map((prop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <prop.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {prop.description}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {prop.highlight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Join Over 10,000 Satisfied Customers
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Experience the difference with Household Planet Kenya. Quality products, 
            exceptional service, and unbeatable value - all delivered to your doorstep.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-100 text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5K+</div>
              <div className="text-blue-100 text-sm">Products Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold">47</div>
              <div className="text-blue-100 text-sm">Counties Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-blue-100 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}