'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { RatingDisplay } from '@/components/ui/RatingDisplay';
import { Star, ShoppingCart, Heart, MessageCircle, Truck, Shield, RotateCcw, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/contexts/ToastContext';
import { openWhatsAppForProduct } from '@/lib/whatsapp';
import { api } from '@/lib/api';
import { Product, ProductVariant, Review } from '@/types';
import { formatPrice } from '@/lib/utils';
import { getImageUrl, handleImageError } from '@/lib/image-utils';
import { addToRecentlyViewed } from '@/lib/recentlyViewed';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import { DeliveryInfo } from '@/components/products/DeliveryInfo';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.getProductBySlug(slug) as Product;
        setProduct(response);
        
        if (response.variants && response.variants.length > 0) {
          setSelectedVariant(response.variants[0]);
        }

        // Fetch reviews
        await fetchReviews(response.id);
        
        // Track as recently viewed
        addToRecentlyViewed(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load product. Please try again.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchReviews = async (productId: number) => {
    try {
      setReviewsLoading(true);
      const response = await api.getProductReviews(productId);
      setReviews((response as any).data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (formData: FormData) => {
    try {
      const response = await api.createReview(formData);
      
      // Show success message
      showToast({
        type: 'success',
        message: 'Review Submitted! ⭐ Thank you for your feedback. Your review has been posted.'
      });
      
      // Refresh reviews after submission
      if (product) {
        await fetchReviews(product.id);
      }
      
      return response;
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Show error message
      showToast({
        variant: 'destructive',
        title: 'Review Failed ❌',
        description: (error as Error).message || 'Failed to submit review. Please try again.',
      });
      
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const maxStock = selectedVariant?.stock || product.stock || 0;
    if (quantity > maxStock) {
      showToast({
        variant: 'destructive',
        title: 'Insufficient Stock ⚠️',
        description: `Only ${maxStock} items available`,
      });
      return;
    }
    
    const wasAdded = await addToCart({
      id: `${selectedVariant?.id || product.id}-${Date.now()}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      product,
      variant: selectedVariant || undefined,
    });
    
    if (wasAdded) {
      showToast({
        variant: 'cart',
        title: 'Added to Cart! 🛒',
        description: `${quantity}x ${product.name} • Ready for checkout`,
      });
    } else {
      showToast({
        variant: 'info',
        title: 'Already in Cart 📦',
        description: `${product.name} • Check your cart`,
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (isInWishlist(product.id.toString())) {
      await removeFromWishlist(product.id.toString());
      showToast({
        variant: 'wishlist',
        title: 'Removed from Wishlist 💔',
        description: `${product.name} • No longer saved`,
      });
    } else {
      const added = await addToWishlist(product);
      if (added) {
        showToast({
          variant: 'wishlist',
          title: 'Added to Wishlist! ❤️',
          description: `${product.name} • Saved for later`,
        });
      } else {
        showToast({
          variant: 'info',
          title: 'Already in Wishlist 💖',
          description: `${product.name} • Already saved`,
        });
      }
    }
  };

  const handleWhatsAppOrder = () => {
    openWhatsAppForProduct(product);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock || 0;
  const productImages = product.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>{product.category?.name || 'Products'}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-2 sm:space-y-4">
            <div 
              className="aspect-square bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg cursor-zoom-in w-full"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={getImageUrl(productImages[selectedImageIndex])}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: isHovering ? 'scale(2)' : 'scale(1)',
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                }}
                onError={handleImageError}
              />
            </div>
            
            {/* Additional Product Images - Mobile Optimized */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {productImages.slice(0, 8).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
            

          </div>

          {/* Product Info */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{product.shortDescription || product.description}</p>
            </div>

            {/* Rating and SKU */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <RatingDisplay 
                rating={product.averageRating || 0} 
                reviewCount={product.reviewCount || 0} 
                size="md"
              />
              <div className="text-sm text-gray-500">
                <span className="font-medium">SKU:</span> {product.sku}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">
                {formatPrice(currentPrice)}
              </span>
              {product.comparePrice && product.comparePrice > currentPrice && (
                <span className="text-base sm:text-lg md:text-xl text-gray-500 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                currentStock > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={`font-medium text-sm ${
                currentStock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Options:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.name} - {formatPrice(variant.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="font-semibold text-gray-900 text-sm">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-lg font-medium"
                >
                  -
                </button>
                <span className="px-4 py-3 font-medium min-w-[60px] text-center text-lg">{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity < currentStock) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:block space-y-3">
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className={`px-4 py-3 ${
                    isInWishlist(product.id.toString()) ? 'bg-red-50 text-red-600 border-red-200' : ''
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id.toString()) ? 'fill-red-600' : ''
                    }`}
                  />
                </Button>
              </div>
              
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Order via WhatsApp
              </Button>
            </div>

            {/* Desktop Trust Badges */}
            <div className="hidden md:grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                <p className="text-xs text-gray-600">Same day in Nairobi</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">M-Pesa & Card</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-600">7-day policy</p>
              </div>
            </div>

            {/* Delivery Information - Desktop Only */}
            <div className="mt-6 hidden md:block">
              <DeliveryInfo
                productId={product.id.toString()}
                weight={product.weight}
                dimensions={product.dimensions}
                category={product.category?.slug || 'general'}
                price={currentPrice}
              />
            </div>
          </div>
        </div>

        {/* Mobile Trust Badges & Delivery Info */}
        <div className="md:hidden mt-4 sm:mt-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs font-medium text-gray-900">Fast Delivery</p>
                <p className="text-xs text-gray-600">Same day</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">M-Pesa & Card</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-600">7-day policy</p>
              </div>
            </div>
            
            <DeliveryInfo
              productId={product.id.toString()}
              weight={product.weight}
              dimensions={product.dimensions}
              category={product.category?.slug || 'general'}
              price={currentPrice}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-6 sm:mt-8 md:mt-16">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-8">
            <div className="space-y-6 md:space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{product.description}</p>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <ul className="grid grid-cols-1 gap-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900 text-sm md:text-base">{key}</span>
                        <span className="text-gray-600 text-sm md:text-base">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
            {product.categoryId ? (
              <ProductRecommendations 
                productId={product.id.toString()}
                title="Related Products"
                type="RELATED"
                limit={6}
              />
            ) : (
              <div className="py-4 md:py-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <span className="text-orange-600 mr-2">⭐</span>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Related Products</h2>
                </div>
                <p className="text-gray-500 text-center py-8">No related products found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 space-y-6">
          <ReviewForm 
            productId={product.id} 
            onSubmit={handleReviewSubmit}
          />
          
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            {reviewsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar - Enhanced */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:p-3 z-50 shadow-lg" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleAddToWishlist}
            className={`min-w-[44px] sm:min-w-[52px] min-h-[44px] sm:min-h-[52px] px-2 sm:px-3 flex items-center justify-center ${
              isInWishlist(product.id.toString()) ? 'bg-red-50 text-red-600 border-red-200' : ''
            }`}
          >
            <Heart
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                isInWishlist(product.id.toString()) ? 'fill-red-600' : ''
              }`}
            />
          </Button>
          
          <Button
            onClick={handleWhatsAppOrder}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white min-h-[44px] sm:min-h-[52px] font-medium text-sm sm:text-base"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span>WhatsApp</span>
          </Button>
          
          <Button
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white min-h-[44px] sm:min-h-[52px] font-medium disabled:opacity-50 text-sm sm:text-base"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            <span className="sm:hidden">{currentStock <= 0 ? 'Out' : 'Cart'}</span>
          </Button>
        </div>
        
        {/* Price and Stock Info */}
        <div className="flex items-center justify-between mt-1 sm:mt-2 text-sm">
          <span className="font-bold text-orange-600 text-base sm:text-lg">{formatPrice(currentPrice)}</span>
          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
            currentStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
  );
}