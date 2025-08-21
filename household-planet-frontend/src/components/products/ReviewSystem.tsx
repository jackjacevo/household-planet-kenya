'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Camera, Filter, ChevronDown, Verified, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Review {
  id: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  helpfulVotes: number;
  unhelpfulVotes: number;
  isVerified: boolean;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewSystemProps {
  reviews: Review[];
  productId: string;
  onAddReview?: (review: any) => void;
}

export function ReviewSystem({ reviews, productId, onAddReview }: ReviewSystemProps) {
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showPhotosOnly, setShowPhotosOnly] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    photos: [] as string[]
  });

  const handleVote = (reviewId: string, type: 'helpful' | 'unhelpful') => {
    // API call to vote on review
    console.log(`Voting ${type} on review ${reviewId}`);
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    // Filter by rating
    if (reviewFilter !== 'all') {
      const rating = parseInt(reviewFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }
    
    // Filter by photos
    if (showPhotosOnly) {
      filtered = filtered.filter(review => review.photos && review.photos.length > 0);
    }
    
    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpfulVotes - a.helpfulVotes;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = getRatingDistribution();
  const filteredReviews = getFilteredReviews();

  const handleSubmitReview = () => {
    if (onAddReview) {
      onAddReview({
        ...newReview,
        productId,
        createdAt: new Date().toISOString()
      });
    }
    setNewReview({ rating: 5, title: '', comment: '', photos: [] });
    setShowAddReview(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddReview(!showAddReview)}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
        >
          Write a Review
        </Button>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Rating Breakdown</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPhotosOnly}
              onChange={(e) => setShowPhotosOnly(e.target.checked)}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span>With Photos</span>
            </span>
          </label>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          
          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="text-2xl"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= newReview.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Summarize your review"
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Share your experience with this product"
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Add Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload photos</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSubmitReview}>Submit Review</Button>
            <Button variant="outline" onClick={() => setShowAddReview(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review, index) => (
          <motion.div 
            key={review.id} 
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.isVerified && (
                    <div className="ml-3 flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      <Verified className="h-3 w-3" />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                </div>
                {review.title && (
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{review.title}</h4>
                )}
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className="font-medium">{review.user.name}</span>
                  <span>•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {review.photos.map((photo, photoIndex) => (
                    <button
                      key={photoIndex}
                      onClick={() => setLightboxIndex(photoIndex)}
                      className="relative w-20 h-20 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                    >
                      <Image
                        src={photo}
                        alt={`Review photo ${photoIndex + 1}`}
                        fill
                        className="object-cover group-hover:brightness-110 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Was this helpful?</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote(review.id, 'helpful')}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpfulVotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(review.id, 'unhelpful')}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{review.unhelpfulVotes}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-gray-400 mb-4">
              <Star className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your filters or be the first to write a review!</p>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightboxIndex >= 0 && filteredReviews.some(r => r.photos && r.photos.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(-1)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Find the photo from all reviews */}
              {(() => {
                const allPhotos = filteredReviews.flatMap(r => r.photos || []);
                return allPhotos[lightboxIndex] && (
                  <Image
                    src={allPhotos[lightboxIndex]}
                    alt="Review photo"
                    width={800}
                    height={600}
                    className="object-contain rounded-lg"
                  />
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}