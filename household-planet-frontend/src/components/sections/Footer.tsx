'use client';

import { motion } from 'framer-motion';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiClock
} from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Shop': [
      'All Products',
      'Kitchen & Dining',
      'Home Decor',
      'Furniture',
      'Cleaning Supplies',
      'New Arrivals'
    ],
    'Customer Service': [
      'Contact Us',
      'Shipping Info',
      'Returns & Exchanges',
      'Size Guide',
      'FAQ',
      'Track Your Order'
    ],
    'Company': [
      'About Us',
      'Careers',
      'Press',
      'Sustainability',
      'Terms of Service',
      'Privacy Policy'
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4">Household Planet Kenya</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for quality household essentials. We bring comfort, 
                style, and functionality to homes across Kenya with premium products and 
                exceptional service.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiPhone className="h-5 w-5 text-blue-400 mr-3" />
                  <a 
                    href="tel:+254790227760" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    +254 790 227 760
                  </a>
                </div>
                
                <div className="flex items-center">
                  <FiMail className="h-5 w-5 text-blue-400 mr-3" />
                  <a 
                    href="mailto:householdplanet819@gmail.com" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    householdplanet819@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center">
                  <FiMapPin className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-300">Nairobi, Kenya</span>
                </div>
                
                <div className="flex items-center">
                  <FiClock className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-300">Mon - Sat: 8AM - 8PM</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Media & Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://wa.me/254790227760" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors"
                  title="WhatsApp"
                >
                  <span className="text-lg">💬</span>
                </a>
                <a 
                  href="#" 
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  title="Facebook"
                >
                  <span className="text-lg">📘</span>
                </a>
                <a 
                  href="#" 
                  className="bg-pink-600 hover:bg-pink-700 p-2 rounded-full transition-colors"
                  title="Instagram"
                >
                  <span className="text-lg">📷</span>
                </a>
                <a 
                  href="#" 
                  className="bg-blue-400 hover:bg-blue-500 p-2 rounded-full transition-colors"
                  title="Twitter"
                >
                  <span className="text-lg">🐦</span>
                </a>
              </div>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold mb-2">Payment Methods</h4>
              <div className="flex space-x-2">
                <div className="bg-gray-800 px-3 py-1 rounded text-sm">M-Pesa</div>
                <div className="bg-gray-800 px-3 py-1 rounded text-sm">Visa</div>
                <div className="bg-gray-800 px-3 py-1 rounded text-sm">Mastercard</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center"
        >
          <p className="text-gray-400 text-sm">
            © {currentYear} Household Planet Kenya. All rights reserved. | 
            <span className="ml-1">Transforming Your Home, One Product at a Time</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}