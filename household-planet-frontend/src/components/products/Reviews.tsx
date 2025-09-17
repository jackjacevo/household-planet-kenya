import React from 'react';

interface ReviewsProps {
  productId: number;
}

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
      <p className="text-gray-600">Reviews for product {productId} will be displayed here.</p>
    </div>
  );
};

export default Reviews;
