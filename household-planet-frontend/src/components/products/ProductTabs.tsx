'use client';

import { useState } from 'react';
import { FiStar, FiThumbsUp, FiCamera } from 'react-icons/fi';
import Image from 'next/image';

interface Product {
  id: string;
  description: string;
  specifications?: any;
  sizeGuide?: string;
  deliveryInfo?: string;
  reviews: Review[];
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user: { name: string };
  images: string[];
  createdAt: string;
  isHelpful: number;
}

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: `Reviews (${product.reviews?.length || 0})` },
    { id: 'delivery', label: 'Delivery Info' }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
          </div>
        )}

        {activeTab === 'specifications' && (
          <div>
            {product.specifications ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-gray-600">{value as string}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              <>
                {/* Reviews Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-1">
                        {renderStars(Math.round(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length))}
                      </div>
                      <div className="text-sm text-gray-600">{product.reviews.length} reviews</div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = product.reviews.filter(review => review.rating === rating).length;
                        const percentage = (count / product.reviews.length) * 100;
                        return (
                          <div key={rating} className="flex items-center gap-2 mb-1">
                            <span className="text-sm w-8">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {review.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{review.user.name}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                          )}
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          
                          {/* Review Images */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {review.images.map((image, index) => (
                                <div key={index} className="w-16 h-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={image}
                                    alt={`Review image ${index + 1}`}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                              <FiThumbsUp size={14} />
                              Helpful ({review.isHelpful})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FiStar size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Be the first to review this product</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Standard Delivery</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 3-5 business days</li>
                    <li>• Free on orders over KSh 2,000</li>
                    <li>• KSh 200 for orders under KSh 2,000</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Express Delivery</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 1-2 business days</li>
                    <li>• KSh 500 delivery fee</li>
                    <li>• Available in major cities</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Return Policy</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 30-day return window</li>
                <li>• Items must be in original condition</li>
                <li>• Free returns for defective items</li>
                <li>• Customer pays return shipping for change of mind</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}