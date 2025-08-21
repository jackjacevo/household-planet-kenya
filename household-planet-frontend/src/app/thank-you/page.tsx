'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { 
  Heart, 
  Star, 
  Gift, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Mail,
  Phone,
  ShoppingBag,
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const shareExperience = (platform: string) => {
    const url = window.location.origin;
    const text = `Just had an amazing shopping experience at Household Planet Kenya! 🏠✨ Great products, fast delivery, and excellent service. Highly recommended! #HouseholdPlanetKenya #OnlineShopping`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      default:
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
  };

  const subscribeToNewsletter = async () => {
    if (!email) return;
    
    try {
      // API call to subscribe to newsletter
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) return;
    
    try {
      // API call to submit feedback
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    }
  };

  const recommendedProducts = [
    {
      id: '1',
      name: 'Premium Kitchen Set',
      price: 4500,
      image: '/images/kitchen-set.jpg',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Luxury Bedding Collection',
      price: 3200,
      image: '/images/bedding.jpg',
      rating: 4.9
    },
    {
      id: '3',
      name: 'Smart Home Organizer',
      price: 2800,
      image: '/images/organizer.jpg',
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Thank You! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your order has been successfully placed!
          </p>
          {orderNumber && (
            <p className="text-lg text-orange-600 font-semibold">
              Order #{orderNumber}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What's Next */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Sparkles className="h-6 w-6 mr-3 text-orange-500" />
                What Happens Next?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Order Confirmation</h3>
                    <p className="text-gray-600">You'll receive an email confirmation with your order details within 5 minutes.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Order Processing</h3>
                    <p className="text-gray-600">Our team will carefully prepare your items for shipment within 24 hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Shipping & Delivery</h3>
                    <p className="text-gray-600">Track your package and receive it at your doorstep within 2-5 business days.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Experience */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Share2 className="h-6 w-6 mr-3 text-pink-500" />
                Share Your Experience
              </h2>
              
              <p className="text-gray-600 mb-6">
                Love shopping with us? Share your experience with friends and family!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => shareExperience('facebook')}
                  className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareExperience('twitter')}
                  className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-blue-50 hover:border-blue-400"
                >
                  <Twitter className="h-6 w-6 text-blue-400" />
                  <span className="text-sm">Twitter</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareExperience('whatsapp')}
                  className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-green-50 hover:border-green-400"
                >
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <span className="text-sm">WhatsApp</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareExperience('copy')}
                  className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-gray-50"
                >
                  <Share2 className="h-6 w-6 text-gray-600" />
                  <span className="text-sm">Copy Link</span>
                </Button>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Star className="h-6 w-6 mr-3 text-yellow-500" />
                Rate Your Experience
              </h2>
              
              {!feedbackSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 mb-3">How was your shopping experience?</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                        >
                          <Star className="h-8 w-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us more (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="What did you love about your experience?"
                    />
                  </div>
                  
                  <Button
                    onClick={submitFeedback}
                    disabled={rating === 0}
                    className="w-full"
                  >
                    Submit Feedback
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your feedback helps us improve our service.</p>
                </div>
              )}
            </div>

            {/* Recommended Products */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-3 text-purple-500" />
                You Might Also Like
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">{formatPrice(product.price)}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Product
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Newsletter Signup */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Gift className="h-5 w-5 mr-2 text-orange-500" />
                Stay Updated
              </h3>
              
              {!subscribed ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Get exclusive deals, new arrivals, and home tips delivered to your inbox!
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      onClick={subscribeToNewsletter}
                      disabled={!email}
                      className="w-full"
                      size="sm"
                    >
                      Subscribe
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-semibold">Subscribed!</p>
                  <p className="text-gray-600 text-sm">Welcome to our newsletter family!</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {orderId && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/track/${orderId}`)}
                    className="w-full justify-start"
                  >
                    Track Your Order
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="w-full justify-start"
                >
                  Continue Shopping
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/wishlist')}
                  className="w-full justify-start"
                >
                  View Wishlist
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/contact')}
                  className="w-full justify-start"
                >
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Need Help?
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-orange-500" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p>+254790 227 760</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-orange-500" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p>householdplanet819@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-3 text-orange-500" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p>Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Thank you for choosing Household Planet Kenya! 🏠
          </p>
          <Link href="/products">
            <Button size="lg" className="px-8">
              Explore More Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}