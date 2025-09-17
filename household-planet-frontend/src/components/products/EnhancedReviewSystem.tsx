'use client';

import { useState, useEffect } from 'react';
import { StarIcon, HandThumbUpIcon, FlagIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  pros?: string[];
  cons?: string[];
  isVerified: boolean;
  isHelpful: number;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

interface EnhancedReviewSystemProps {
  productId: number;
  canReview?: boolean;
}

export default function EnhancedReviewSystem({ productId, canReview = false }: EnhancedReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Review form state
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
    images: [] as File[]
  });
  
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [productId, filterRating, sortBy]);

  const loadReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });
      
      if (filterRating) {
        params.set('rating', filterRating.toString());
      }
      
      const orderBy = sortBy === 'newest' ? 'createdAt' : 
                     sortBy === 'oldest' ? 'createdAt' : 'isHelpful';
      const order = sortBy === 'oldest' ? 'asc' : 'desc';
      
      params.set('orderBy', orderBy);
      params.set('order', order);

      const response = await api.get(`/reviews/product/${productId}?${params}`);
      
      if (pageNum === 1) {
        setReviews(response.data.data);
      } else {
        setReviews(prev => [...prev, ...response.data.data]);
      }
      
      setHasMore(response.data.meta.page < response.data.meta.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const submitReview = async () => {
    if (!user || newReview.rating === 0) return;

    try {
      const formData = new FormData();
      formData.append('productId', productId.toString());
      formData.append('rating', newReview.rating.toString());
      formData.append('title', newReview.title);
      formData.append('comment', newReview.comment);
      formData.append('pros', JSON.stringify(newReview.pros.filter(p => p.trim())));
      formData.append('cons', JSON.stringify(newReview.cons.filter(c => c.trim())));
      
      newReview.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      await api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reset form and reload reviews
      setNewReview({
        rating: 0,
        title: '',
        comment: '',
        pros: [''],
        cons: [''],
        images: []
      });
      setShowReviewForm(false);
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const markHelpful = async (reviewId: number) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      loadReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const reportReview = async (reviewId: number) => {
    try {
      await api.post(`/reviews/${reviewId}/report`);
      loadReviews();
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const addProCon = (type: 'pros' | 'cons') => {
    setNewReview(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const updateProCon = (type: 'pros' | 'cons', index: number, value: string) => {
    setNewReview(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  const removeProCon = (type: 'pros' | 'cons', index: number) => {
    setNewReview(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - newReview.images.length);
      setNewReview(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            {canReview && user && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Write Review
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.average))}
              </div>
              <div className="text-sm text-gray-600">{stats.total} reviews</div>
            </div>

            <div className="space-y-2">
              {stats.distribution.map((dist) => (
                <div key={dist.rating} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{dist.rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Filter by rating:</label>
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map(rating => (
              <option key={rating} value={rating}>{rating} stars</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Review Title</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Summarize your experience"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Share your thoughts about this product"
                  />
                </div>

                {/* Pros */}
                <div>
                  <label className="block text-sm font-medium mb-2">Pros</label>
                  {newReview.pros.map((pro, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={pro}
                        onChange={(e) => updateProCon('pros', index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        placeholder="What did you like?"
                      />
                      {newReview.pros.length > 1 && (
                        <button
                          onClick={() => removeProCon('pros', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addProCon('pros')}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    + Add another pro
                  </button>
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-sm font-medium mb-2">Cons</label>
                  {newReview.cons.map((con, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={con}
                        onChange={(e) => updateProCon('cons', index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        placeholder="What could be improved?"
                      />
                      {newReview.cons.length > 1 && (
                        <button
                          onClick={() => removeProCon('cons', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addProCon('cons')}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    + Add another con
                  </button>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Photos (optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newReview.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {newReview.images.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-400">
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Upload up to 5 photos</p>
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={newReview.rating === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {renderStars(review.rating)}
                  {review.isVerified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  by {review.user.name} • {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {review.title && (
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            )}

            {review.comment && (
              <p className="text-gray-700 mb-3">{review.comment}</p>
            )}

            {/* Pros and Cons */}
            {(review.pros?.length || review.cons?.length) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {review.pros && review.pros.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Pros:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.cons && review.cons.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-1">Cons:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-3">
                {review.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover rounded border"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => markHelpful(review.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <HandThumbUpIcon className="w-4 h-4" />
                <span>Helpful ({review.isHelpful})</span>
              </button>
              <button
                onClick={() => reportReview(review.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <FlagIcon className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => loadReviews(page + 1)}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
}
