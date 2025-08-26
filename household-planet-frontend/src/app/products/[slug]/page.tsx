'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, Skeleton } from '@/components/ui/LoadingStates';
import { Star, ShoppingCart, Heart, Play, MessageCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { openWhatsAppForProduct } from '@/lib/whatsapp';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import { RecentlyViewed } from '@/components/products/RecentlyViewed';
import { ImageGallery } from '@/components/products/ImageGallery';
import { SwipeableGallery } from '@/components/products/SwipeableGallery';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ReviewSystem } from '@/components/products/ReviewSystem';
import { EnhancedSizeGuide } from '@/components/products/EnhancedSizeGuide';
import { Enhanced360Gallery } from '@/components/products/Enhanced360Gallery';
import { ProductVideoPlayer } from '@/components/products/ProductVideoPlayer';
import { DeliveryInfo } from '@/components/products/DeliveryInfo';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { generateProductSchema, generateReviewSchema } from '@/lib/seo';
import { getProductPageLinks, getRelatedProductLinks } from '@/lib/internal-links';
import { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Track product view
        if (slug) {
          console.log('Tracking product view for:', slug);
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, this would fetch from your API
        const mockProduct: Product = {
      id: '1',
      name: 'Premium Kitchen Knife Set',
      slug: 'premium-kitchen-knife-set',
      description: 'High-quality stainless steel knife set perfect for all your kitchen needs. Includes chef knife, bread knife, paring knife, and more. Ergonomic handles for comfortable grip.',
      shortDescription: 'Complete kitchen knife set with premium stainless steel blades',
      sku: 'KITCHEN-KNIFE-001',
      price: 2999,
      comparePrice: 3999,
      images: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
        'https://images.unsplash.com/photo-1575312066712-29dec44d7726?w=800',
        'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800',
      ],
      images360: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
        'https://images.unsplash.com/photo-1575312066712-29dec44d7726?w=800',
        'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800',
      ],
      videos: ['https://example.com/product-video.mp4'],
      weight: 1.2,
      dimensions: { length: 25, width: 15, height: 5 },
      features: [
        'Premium stainless steel construction',
        'Ergonomic handle design',
        'Sharp, durable blades',
        'Easy to clean and maintain',
        'Professional grade quality'
      ],
      specifications: {
        'Material': 'Stainless Steel',
        'Handle': 'Ergonomic Grip',
        'Blade Length': '20cm - 8cm',
        'Weight': '1.2kg',
        'Care': 'Hand wash recommended'
      },
      categoryId: '1',
      isActive: true,
      isFeatured: true,
      tags: ['kitchen', 'knives', 'cooking', 'stainless-steel'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      category: {
        id: '1',
        name: 'Kitchen & Dining',
        slug: 'kitchen-dining',
        isActive: true,
        sortOrder: 1,
      },
      variants: [
        {
          id: '1',
          productId: '1',
          name: 'Standard Set',
          sku: 'KITCHEN-KNIFE-001-STD',
          price: 2999,
          stock: 15,
          size: 'Standard',
          color: 'Silver'
        },
        {
          id: '2',
          productId: '1',
          name: 'Deluxe Set',
          sku: 'KITCHEN-KNIFE-001-DLX',
          price: 3999,
          stock: 8,
          size: 'Large',
          color: 'Black'
        }
      ],
      reviews: [
        {
          id: '1',
          productId: '1',
          userId: '1',
          rating: 5,
          title: 'Excellent quality!',
          comment: 'These knives are amazing. Sharp and comfortable to use.',
          photos: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200'],
          helpfulVotes: 12,
          unhelpfulVotes: 1,
          isVerified: true,
          createdAt: '2024-01-15',
          user: {
            id: '1',
            email: 'user@example.com',
            phone: '+254700000000',
            name: 'Happy Customer',
            role: 'CUSTOMER',
            emailVerified: true,
            phoneVerified: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        },
      ],
      averageRating: 5,
      reviewCount: 1,
      stock: 15,
    };
        
        setProduct(mockProduct);
      } catch (err) {
        setError('Failed to load product. Please try again.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Skeleton type="product-card" />
          </div>
          <div className="space-y-6">
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
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorState
          type="not-found"
          title="Product Not Found"
          message={error}
          action={{
            label: 'Try Again',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorState
          type="not-found"
          title="Product Not Found"
          message="The product you're looking for doesn't exist."
        />
      </div>
    );
  }

  const handleAddToCart = () => {
    const maxStock = selectedVariant?.stock || product.stock || 0;
    if (quantity > maxStock) {
      alert(`Only ${maxStock} items available in stock`);
      return;
    }
    
    addToCart({
      id: selectedVariant?.id || product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      product,
      variant: selectedVariant,
    });
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
  };

  const handleWhatsAppOrder = () => {
    openWhatsAppForProduct(product);
  };

  const productSchema = generateProductSchema(product);
  const reviewSchema = generateReviewSchema(product.reviews || []);
  const structuredData = [productSchema, ...reviewSchema];

  return (
    <>
      <SEOHead
        title={`${product.name} - Quality ${product.category.name}`}
        description={product.shortDescription || product.description}
        keywords={[
          product.name.toLowerCase(),
          product.category.name.toLowerCase(),
          ...(product.tags || []),
          'Kenya',
          'quality',
          'fast delivery'
        ]}
        image={product.images[0]}
        url={`/products/${product.slug}`}
        type="product"
        price={selectedVariant?.price || product.price}
        currency="KES"
        availability={((selectedVariant?.stock || product.stock || 0) > 0) ? 'in_stock' : 'out_of_stock'}
        brand="Household Planet Kenya"
        condition="new"
        rating={product.averageRating}
        reviewCount={product.reviewCount}
        structuredData={structuredData}
      />
      
      <div className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { name: 'Products', url: '/products' },
              { name: product.category.name, url: `/categories/${product.category.slug}` },
              { name: product.name, url: `/products/${product.slug}` }
            ]}
          />
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Image Gallery */}
        <div>
          {isMobile ? (
            <SwipeableGallery images={product.images} productName={product.name} />
          ) : (
            <ImageGallery images={product.images} productName={product.name} />
          )}
          
          {/* 360° Gallery */}
          {product.images360 && product.images360.length > 0 && (
            <div className="mt-4">
              <Enhanced360Gallery 
                images360={product.images360} 
                productName={product.name}
                autoRotate={false}
              />
            </div>
          )}
          
          {/* Product Video */}
          {product.videos && product.videos.length > 0 && (
            <div className="mt-4">
              <ProductVideoPlayer
                videos={product.videos}
                productName={product.name}
                thumbnail={product.images[0]}
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Brand */}
          {product.brand && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">Brand: </span>
              <span className="text-sm font-medium text-gray-700">{product.brand.name}</span>
            </div>
          )}
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.averageRating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mb-4">
            <span className="text-2xl md:text-3xl font-bold text-orange-600">
              {formatPrice(selectedVariant?.price || product.price)}
            </span>
            {product.comparePrice && product.comparePrice > (selectedVariant?.price || product.price) && (
              <span className="ml-2 text-lg md:text-xl text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <VariantSelector 
                variants={product.variants} 
                onVariantChange={setSelectedVariant}
              />
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <label className="font-semibold">Quantity:</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="min-h-44 min-w-44"
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const maxStock = selectedVariant?.stock || product.stock || 0;
                  if (quantity < maxStock) {
                    setQuantity(quantity + 1);
                  }
                }}
                className="min-h-44 min-w-44"
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <EnhancedSizeGuide 
              category={product.category.slug} 
              productType={product.name.toLowerCase()}
            />
          </div>

          {/* Mobile Sticky Actions */}
          {isMobile && (
            <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className={`min-h-44 min-w-44 ${
                    isInWishlist(product.id) ? 'bg-red-50 text-red-600' : ''
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id) ? 'fill-red-600' : ''
                    }`}
                  />
                </Button>
                
                <Button
                  onClick={handleWhatsAppOrder}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white min-h-44"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={!(selectedVariant?.stock || product.stock) || (selectedVariant?.stock || product.stock || 0) <= 0}
                  className="flex-1 min-h-44"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Actions */}
          {!isMobile && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!(selectedVariant?.stock || product.stock) || (selectedVariant?.stock || product.stock || 0) <= 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className={`${
                    isInWishlist(product.id) ? 'bg-red-50 text-red-600' : ''
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id) ? 'fill-red-600' : ''
                    }`}
                  />
                </Button>
              </div>
              
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Order via WhatsApp
              </Button>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div className="mt-6">
            <DeliveryInfo
              productId={product.id}
              weight={product.weight}
              dimensions={product.dimensions}
              category={product.category.slug}
              price={selectedVariant?.price || product.price}
            />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 md:mt-12">
        <ReviewSystem 
          reviews={product.reviews || []} 
          productId={product.id}
        />
      </div>

      {/* Product Recommendations */}
      <ProductRecommendations 
        productId={product.id} 
        title="Frequently Bought Together" 
        type="FREQUENTLY_BOUGHT_TOGETHER" 
      />
      
      <ProductRecommendations 
        productId={product.id} 
        title="Related Products" 
        type="RELATED" 
      />

        {/* Internal Links for SEO */}
        <div className="mt-8 md:mt-12">
          <InternalLinks
            title="Related Pages"
            links={getProductPageLinks(product.category.name)}
            className="mb-8"
          />
          <InternalLinks
            title="More Products"
            links={getRelatedProductLinks(product.id, product.category.name)}
          />
        </div>

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>
    </>
  );
}
