'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Phone, Mail, MessageCircle } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

// Fallback FAQs in case API fails
const fallbackFaqs: FAQ[] = [
  {
    id: 1,
    question: 'What products do you sell?',
    answer: 'We offer a wide range of household items including kitchen appliances, home decor, cleaning supplies, storage solutions, bedding, and much more. All products are carefully selected for quality and value.',
    category: 'Products'
  },
  {
    id: 2,
    question: 'What are your delivery areas?',
    answer: 'We deliver across Kenya with 4 pricing tiers: Tier 1 (KSh 100-200) includes Nairobi CBD, Kajiado, Kitengela. Tier 2 (KSh 250-300) includes Westlands, Kilimani, Machakos. Tier 3 (KSh 350-650) includes Karen, Mombasa, Kisumu. Tier 4 (KSh 550-1,000) includes JKIA, Ngong, and remote areas.',
    category: 'Delivery'
  },
  {
    id: 3,
    question: 'How long does delivery take?',
    answer: 'Delivery takes 1 day for Nairobi areas (CBD, Westlands, Kilimani), 2-3 days for nearby towns (Thika, Machakos, Kiambu), and 3-5 days for upcountry locations (Mombasa, Kisumu, Eldoret). Express delivery available for select locations.',
    category: 'Delivery'
  },
  {
    id: 4,
    question: 'What are your delivery charges?',
    answer: 'Delivery charges are tiered: Tier 1 (KSh 100-200), Tier 2 (KSh 250-300), Tier 3 (KSh 350-650), Tier 4 (KSh 550-1,000). FREE shipping on orders above KSh 5,000. 50% OFF delivery on orders above KSh 3,000.',
    category: 'Delivery'
  },
  {
    id: 5,
    question: 'What payment methods do you accept?',
    answer: 'We accept M-Pesa (most popular), Airtel Money, bank transfers, and cash on delivery. M-Pesa payments are processed instantly for faster order processing.',
    category: 'Payment'
  },
  {
    id: 6,
    question: 'Is cash on delivery available?',
    answer: 'Yes, cash on delivery is available for most areas. A small COD fee may apply depending on your location and order value. Valid ID required for COD orders.',
    category: 'Payment'
  },
  {
    id: 7,
    question: 'How do I track my order?',
    answer: 'After your order ships, you\'ll receive a tracking number via SMS and email. You can track your order using our <a href="/track-order" class="text-orange-600 hover:text-orange-700 underline">Order Tracking page</a> or in your account dashboard.',
    category: 'Orders'
  },
  {
    id: 8,
    question: 'Can I return or exchange items?',
    answer: 'Yes, we have a 7-day return policy for unused items in original packaging. Items must be in resalable condition. Contact customer service to initiate a return.',
    category: 'Returns'
  },
  {
    id: 9,
    question: 'Do you offer promo codes?',
    answer: 'Yes! We regularly offer promo codes for discounts. Try codes like SAVE10, WELCOME20, or HOUSEHOLD15. You can apply promo codes during checkout in your cart.',
    category: 'Pricing'
  },
  {
    id: 10,
    question: 'How do I create an account?',
    answer: 'Click "Register" at the top of the page, fill in your details including name, email, and phone number, then verify your account. You can also create an account during checkout.',
    category: 'Account'
  },
  {
    id: 11,
    question: 'Where is your physical location?',
    answer: 'Our showroom is located at Moi Avenue, Iconic Business Plaza, Basement Shop B10, Nairobi. Visit us Mon-Sat: 8AM-6PM or contact us at +254790 227 760.',
    category: 'Store'
  },
  {
    id: 12,
    question: 'How can I contact customer service?',
    answer: 'Contact us via phone (+254790 227 760), WhatsApp, email (householdplanet819@gmail.com), or through our contact form. We respond within 24 hours during business hours.',
    category: 'Support'
  },
  {
    id: 13,
    question: 'Do you offer bulk discounts?',
    answer: 'Yes, we offer special pricing for bulk orders and wholesale purchases. Contact our sales team for custom quotes on large quantity orders.',
    category: 'Pricing'
  },
  {
    id: 14,
    question: 'Is my personal information secure?',
    answer: 'Yes, we use industry-standard security measures to protect your data. We never share your personal information with third parties without consent.',
    category: 'Security'
  },
  {
    id: 15,
    question: 'What if an item is out of stock?',
    answer: 'If an item becomes unavailable after ordering, we\'ll contact you immediately with alternatives or offer a full refund. You can also request to be notified when items are back in stock.',
    category: 'Products'
  },
  {
    id: 16,
    question: 'How do I cancel my order?',
    answer: 'You can cancel your order within 2 hours of placing it by contacting customer service at +254790 227 760. After processing begins, cancellation may not be possible.',
    category: 'Orders'
  }
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(fallbackFaqs);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaqs();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Extract categories from current FAQs when faqs change
    const uniqueCategories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];
    if (categories.length === 0 && uniqueCategories.length > 0) {
      setCategories(uniqueCategories as string[]);
    }
  }, [faqs, categories.length]);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/content/faqs');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setFaqs(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      // Keep fallback FAQs
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/content/faqs/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Extract categories from current FAQs
        const uniqueCategories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Extract categories from current FAQs
      const uniqueCategories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-orange-600">Questions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, and services
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {expandedFaq === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4"
                >
                  <div className="pt-2 border-t border-gray-100">
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No FAQs found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or category filter
            </p>
          </div>
        )}

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Can't find what you're looking for? Our customer support team is here to help you with any questions about our products or services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Phone className="h-8 w-8 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-3">Mon-Fri 8AM-6PM</p>
              <a href="tel:+254790227760" className="text-orange-600 font-medium hover:text-orange-700">
                +254 790 227 760
              </a>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <MessageCircle className="h-8 w-8 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-3">Quick responses</p>
              <a href="https://wa.me/254790227760" className="text-orange-600 font-medium hover:text-orange-700">
                Chat with us
              </a>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Mail className="h-8 w-8 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-3">We'll respond within 24hrs</p>
              <a href="mailto:householdplanet819@gmail.com" className="text-orange-600 font-medium hover:text-orange-700">
                householdplanet819@gmail.com
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Visit Contact Page
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}