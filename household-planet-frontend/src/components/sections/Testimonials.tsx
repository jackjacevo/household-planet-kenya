'use client';

import { motion } from 'framer-motion';
import { FiMessageCircle } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  product: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const mockTestimonials: Testimonial[] = [
      {
        id: 1,
        name: 'Sarah Wanjiku',
        location: 'Nairobi',
        rating: 5,
        comment: 'Amazing quality products! The cookware set I bought has transformed my kitchen experience. Fast delivery and excellent customer service.',
        avatar: '👩🏾',
        product: 'Premium Cookware Set'
      },
      {
        id: 2,
        name: 'James Mwangi',
        location: 'Mombasa',
        rating: 5,
        comment: 'Best online shopping experience in Kenya. The furniture arrived exactly as described and the quality exceeded my expectations.',
        avatar: '👨🏿',
        product: 'Dining Table Set'
      },
      {
        id: 3,
        name: 'Grace Akinyi',
        location: 'Kisumu',
        rating: 4,
        comment: 'Love the variety of products available. The storage solutions helped organize my entire home. Highly recommend!',
        avatar: '👩🏿',
        product: 'Storage Organizers'
      },
      {
        id: 4,
        name: 'David Kiprop',
        location: 'Eldoret',
        rating: 5,
        comment: 'Professional service from start to finish. The delivery team was courteous and the products are top quality.',
        avatar: '👨🏾',
        product: 'LED Lighting Set'
      },
      {
        id: 5,
        name: 'Mary Njeri',
        location: 'Nakuru',
        rating: 5,
        comment: 'Household Planet Kenya has everything I need for my home. Great prices and authentic products. Will definitely shop again!',
        avatar: '👩🏾',
        product: 'Bedding Collection'
      },
      {
        id: 6,
        name: 'Peter Otieno',
        location: 'Thika',
        rating: 4,
        comment: 'Impressed with the customer support. They helped me choose the right products for my new apartment. Very satisfied!',
        avatar: '👨🏿',
        product: 'Home Decor Items'
      }
    ];
    setTestimonials(mockTestimonials);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Real reviews from satisfied customers across Kenya
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: -currentIndex * 100 + '%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="max-w-4xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-8 shadow-lg"
                    >
                      <div className="flex items-center justify-center mb-6">
                        <FiMessageCircle className="h-8 w-8 text-blue-600" />
                      </div>
                      
                      <blockquote className="text-lg text-gray-700 text-center mb-8 leading-relaxed">
                        &ldquo;{testimonial.comment}&rdquo;
                      </blockquote>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-4xl">{testimonial.avatar}</div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.location}</div>
                          <div className="text-xs text-blue-600 mt-1">Purchased: {testimonial.product}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center mt-4">
                        {[...Array(5)].map((_, i) => (
                          <AiFillStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.8/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2,500+</div>
              <div className="text-sm text-gray-600">Happy Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}