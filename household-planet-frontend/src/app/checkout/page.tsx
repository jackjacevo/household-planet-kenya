'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { usePayment } from '@/hooks/usePayment';
import { useDeliveryLocations } from '@/hooks/useDeliveryLocations';
import { DeliveryLocationSelector } from '@/components/common/DeliveryLocationSelector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { PaymentStatus } from '@/components/payment/PaymentStatus';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { MapPin, Phone, Mail, User, Check, ChevronRight, Plus, Edit2, Truck, Store, X } from 'lucide-react';
import { Address } from '@/types';
import axios from 'axios';
import Image from 'next/image';

type CheckoutStep = 'account' | 'delivery' | 'payment' | 'review' | 'processing';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { initiatePayment, retryPayment, loading } = usePayment();
  const { locations: deliveryLocations } = useDeliveryLocations();
  const [step, setStep] = useState<CheckoutStep>('account');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [manualDeliveryCost, setManualDeliveryCost] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discountAmount: number} | null>(null);

  // Auto-select first payment method when step changes to payment
  useEffect(() => {
    if (step === 'payment' && !selectedPaymentMethod) {
      setSelectedPaymentMethod('CASH_ON_DELIVERY'); // Default to most common method
    }
  }, [step, selectedPaymentMethod]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    county: '',
    town: '',
    street: '',
    notes: '',
    createAccount: false,
    password: '',
  });

  const steps = [
    { id: 'account', title: 'Account', icon: User },
    { id: 'delivery', title: 'Delivery Location', icon: MapPin },
    { id: 'payment', title: 'Payment', icon: Phone },
    { id: 'review', title: 'Review', icon: Check },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadSavedAddresses();
      loadUserProfile(); // Load user profile immediately on mount
    }
    
    // Load checkout data from cart
    const checkoutData = localStorage.getItem('checkoutData');
    if (checkoutData) {
      try {
        const data = JSON.parse(checkoutData);
        console.log('Loading checkout data:', data);
        
        // Restore delivery info
        if (data.deliveryInfo) {
          const { selectedLocation, deliveryCost: savedDeliveryCost, manualDeliveryCost: savedManualCost } = data.deliveryInfo;
          setSelectedDeliveryLocation(selectedLocation || '');
          
          if (savedDeliveryCost > 0) {
            setDeliveryCost(savedDeliveryCost);
          } else if (savedManualCost && parseFloat(savedManualCost) > 0) {
            setDeliveryCost(parseFloat(savedManualCost));
          }
          
          setManualDeliveryCost(savedManualCost || '');
          
          if (selectedLocation || savedManualCost) {
            setDeliveryType('DELIVERY');
          }
        }
        
        // Restore promo code information
        if (data.promoInfo) {
          setAppliedPromo({
            code: data.promoInfo.code,
            discountAmount: data.promoInfo.discountAmount
          });
        }
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    }
  }, []);

  // Also load user profile when component mounts
  useEffect(() => {
    if (hasMounted) {
      const token = localStorage.getItem('token');
      if (token && !formData.fullName) {
        loadUserProfile();
      }
    }
  }, [hasMounted]);

  // Handle client-side mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Sync cart on component mount with retry logic
  useEffect(() => {
    if (!hasMounted) return;
    
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsCartLoading(true);
      
      // Set a timeout to stop loading after 5 seconds
      const loadingTimeout = setTimeout(() => {
        setIsCartLoading(false);
      }, 5000);
      
      const { syncWithBackend } = useCart.getState();
      
      // Retry cart sync up to 3 times with delays
      const syncWithRetry = async (retries = 3) => {
        try {
          await syncWithBackend();
          console.log('Cart synced successfully');
          setIsCartLoading(false);
          clearTimeout(loadingTimeout);
        } catch (error) {
          console.error('Cart sync failed:', error);
          if (retries > 0) {
            console.log(`Retrying cart sync... ${retries} attempts left`);
            setTimeout(() => syncWithRetry(retries - 1), 1000);
          } else {
            setIsCartLoading(false);
            clearTimeout(loadingTimeout);
          }
        }
      };
      
      syncWithRetry();
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [hasMounted]);

  // Load user profile when moving to delivery step if authenticated
  useEffect(() => {
    if (step === 'delivery') {
      const token = localStorage.getItem('token');
      if (token && !formData.phone) {
        loadUserProfile();
      }
    }
  }, [step]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const user = response.data;
      
      // Auto-fill user information, prioritizing existing form data
      const userData = {
        fullName: user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        phone: user.phone || '',
        email: user.email || ''
      };
      
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userData.fullName,
        phone: prev.phone || userData.phone,
        email: prev.email || userData.email
      }));
      
      console.log('User profile loaded:', userData);
      console.log('Form data after profile load:', formData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/addresses`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSavedAddresses(response.data);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/addresses`,
        {
          type: 'SHIPPING',
          fullName: formData.fullName,
          phone: formData.phone,
          county: formData.county,
          town: formData.town,
          street: formData.street,
          isDefault: savedAddresses.length === 0
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSavedAddresses([...savedAddresses, response.data]);
      setSelectedAddressId(response.data.id);
      setShowAddressForm(false);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId) || {
        fullName: formData.fullName,
        phone: formData.phone,
        county: formData.county,
        town: formData.town,
        street: formData.street,
      };
      
      // Validate required fields
      if (!items || items.length === 0) {
        throw new Error('No items in cart');
      }
      
      if (!selectedPaymentMethod) {
        throw new Error('Payment method is required');
      }
      
      if (!formData.fullName || formData.fullName.trim() === '') {
        throw new Error('Full name is required');
      }
      
      if (!formData.phone || formData.phone.trim() === '') {
        throw new Error('Phone number is required');
      }
      
      // Validate delivery information
      if (deliveryType === 'DELIVERY' && !selectedDeliveryLocation && !manualDeliveryCost) {
        throw new Error('Delivery location or cost is required');
      }
      
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.product.price
        })),
        deliveryLocationId: selectedDeliveryLocation || undefined,
        deliveryLocation: selectedDeliveryLocation ? deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.name : undefined,
        deliveryPrice: manualDeliveryCost ? parseFloat(manualDeliveryCost) : deliveryCost,
        paymentMethod: selectedPaymentMethod,
        notes: formData.notes || '',
        customerName: formData.fullName?.trim() || 'Not provided',
        customerPhone: formData.phone?.trim() || 'Not provided',
        customerEmail: formData.email?.trim() || '',
        // Include promo code information
        promoCode: appliedPromo?.code || undefined,
        discountAmount: appliedPromo?.discountAmount || undefined
      };
      
      console.log('Creating order with data:', orderData);
      console.log('Applied promo:', appliedPromo);
      console.log('Selected delivery location:', deliveryLocations.find(loc => loc.id === selectedDeliveryLocation));
      console.log('Delivery cost:', deliveryCost);
      console.log('Final total calculation:', {
        subtotal: getTotalPrice(),
        discount: getDiscountAmount(),
        delivery: getCurrentDeliveryCost(),
        total: getTotal()
      });
      
      // Use different endpoints for authenticated vs guest users
      const endpoint = token && token !== 'null' && token !== 'undefined' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/orders/guest`;
      
      const headers = token && token !== 'null' && token !== 'undefined'
        ? { 'Authorization': `Bearer ${token}` }
        : {};
      
      const response = await axios.post(endpoint, orderData, { headers });
      console.log('Order creation response:', response.data);
      return response.data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Validation errors:', error.response.data.message);
      }
      throw error;
    }
  };

  const handleAccountStep = () => {
    if (isGuest && formData.createAccount) {
      // Create account logic here
    }
    
    // Load user profile when moving to delivery step for authenticated users
    const token = localStorage.getItem('token');
    if (token) {
      loadUserProfile();
    }
    
    setStep('delivery');
  };

  const goBackStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id as CheckoutStep);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGuest && !selectedAddressId && !showAddressForm) {
      setShowAddressForm(true);
      return;
    }
    if (showAddressForm) {
      saveAddress();
    }
    setStep('delivery');
  };

  const handleDeliverySubmit = async () => {
    if (deliveryType === 'PICKUP') {
      setDeliveryCost(0);
      setStep('payment');
    } else if (deliveryType === 'DELIVERY') {
      if (selectedDeliveryLocation) {
        // Location already selected and cost calculated in onChange
        setStep('payment');
      } else if (manualDeliveryCost && parseFloat(manualDeliveryCost) >= 0) {
        // Manual delivery cost entered
        setStep('payment');
      } else {
        alert('Please select a delivery location or enter delivery cost');
        return;
      }
    }
  };

  const handlePaymentSubmit = () => {
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    try {
      console.log('Creating order with form data:', { name: formData.fullName, phone: formData.phone, email: formData.email });
      const newOrderId = await createOrder();
      console.log('Order created successfully with ID:', newOrderId);
      setOrderId(newOrderId);
      
      // Store order completion data for confirmation page
      const orderCompletionData = {
        orderId: newOrderId,
        customerInfo: {
          name: formData.fullName?.trim() || 'Not provided',
          phone: formData.phone?.trim() || 'Not provided',
          email: formData.email?.trim() || ''
        },
        deliveryInfo: {
          type: deliveryType,
          location: selectedDeliveryLocation,
          cost: getCurrentDeliveryCost(),
          notes: formData.notes
        },
        paymentInfo: {
          method: selectedPaymentMethod,
          total: getTotal()
        },
        promoInfo: appliedPromo ? {
          code: appliedPromo.code,
          discountAmount: appliedPromo.discountAmount
        } : null,
        timestamp: new Date().toISOString()
      };
      
      console.log('Storing completion data:', orderCompletionData);
      localStorage.setItem('orderCreated', 'true');
      localStorage.setItem('orderIdToConfirm', newOrderId.toString());
      localStorage.setItem('orderCompletionData', JSON.stringify(orderCompletionData));
      
      // Clear checkout data after successful order creation
      localStorage.removeItem('checkoutData');
      
      // DON'T clear cart yet - wait for order confirmation
      router.push(`/order-confirmation/${newOrderId}`);
    } catch (error) {
      console.error('Order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Order failed. Please try again.';
      alert(errorMessage);
    }
  };

  const handlePaymentComplete = () => {
    clearCart();
    // Add a flag to indicate successful order creation
    localStorage.setItem('orderCreated', 'true');
    // Clean up completion data
    localStorage.removeItem('orderCompletionData');
    router.push('/account/orders');
  };

  const handlePaymentRetry = async () => {
    if (orderId) {
      try {
        await retryPayment(orderId);
      } catch (error) {
        console.error('Retry error:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const selectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setFormData({
      ...formData,
      fullName: address.fullName,
      phone: address.phone,
      county: address.county,
      town: address.town,
      street: address.street,
    });
    setShowAddressForm(false);
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === step);
  };

  const getSubtotal = () => getTotalPrice();
  const getDiscountAmount = () => appliedPromo?.discountAmount || 0;
  const getTotal = () => {
    const subtotal = getTotalPrice();
    const discount = getDiscountAmount();
    let finalDeliveryCost = 0;
    
    if (deliveryType === 'PICKUP') {
      finalDeliveryCost = 0;
    } else {
      // Use deliveryCost if set, otherwise use manualDeliveryCost
      finalDeliveryCost = deliveryCost > 0 ? deliveryCost : (manualDeliveryCost ? parseFloat(manualDeliveryCost) || 0 : 0);
    }
    
    return subtotal - discount + finalDeliveryCost;
  };
  
  const getCurrentDeliveryCost = () => {
    if (deliveryType === 'PICKUP') return 0;
    return deliveryCost > 0 ? deliveryCost : (manualDeliveryCost ? parseFloat(manualDeliveryCost) || 0 : 0);
  };

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while cart is being synced
  if (isCartLoading || (loading && items.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (step === 'processing' && orderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <PaymentStatus
            orderId={orderId}
            onComplete={handlePaymentComplete}
            onRetry={handlePaymentRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-8 pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Checkout</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/cart')}
          className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
          size="sm"
        >
          ← Cart
        </Button>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="hidden md:flex items-center justify-between">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.id;
            const isCompleted = getCurrentStepIndex() > index;
            
            return (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-orange-500 border-orange-500 text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Mobile Progress */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {getCurrentStepIndex() + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-orange-600">
              {steps.find(s => s.id === step)?.title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((getCurrentStepIndex() + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Account Step */}
          {step === 'account' && (
            <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-lg shadow-sm p-4 sm:p-6 border border-green-100">
              {localStorage.getItem('token') ? (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl mb-3">
                      {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : '🌙'}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}!
                    </h2>
                    <p className="text-lg text-gray-700 mb-4">
                      Welcome back! Thank you for choosing Household Planet Kenya for your shopping needs.
                    </p>
                    <div className="bg-white/70 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600 mb-2">🛍️ Ready to complete your order?</p>
                      <p className="text-xs text-green-700">Your cart items are waiting for you!</p>
                    </div>
                  </div>
                  <Button onClick={handleAccountStep} className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white font-semibold py-4" size="lg">
                    Continue to Delivery 🚀
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-4">🛒</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">Almost There!</h2>
                  <p className="text-gray-600 mb-6">Choose how you'd like to proceed with your order</p>
                  
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-4 border border-green-200">
                      <h3 className="font-semibold text-gray-800 mb-2">Already have an account?</h3>
                      <p className="text-sm text-gray-600 mb-3">Sign in for faster checkout and order tracking</p>
                      <Button 
                        onClick={() => router.push('/login?redirect=/checkout')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Sign In 👋
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-500">or</div>
                    
                    <div className="bg-white/70 rounded-lg p-4 border border-orange-200">
                      <h3 className="font-semibold text-gray-800 mb-2">Continue as Guest</h3>
                      <p className="text-sm text-gray-600 mb-3">Quick checkout without creating an account</p>
                      <Button 
                        onClick={() => { setIsGuest(true); handleAccountStep(); }}
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Guest Checkout 🚀
                      </Button>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-2">New to Household Planet?</h3>
                      <p className="text-sm text-gray-600 mb-3">Create an account for exclusive offers and easy reordering</p>
                      <Button 
                        onClick={() => router.push('/register?redirect=/checkout')}
                        variant="outline"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Create Account ✨
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          

          
          {/* Delivery Step */}
          {step === 'delivery' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Information & Delivery</h2>
              
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+254700000000"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - for order updates and receipts</p>
                  </div>
                </div>
              </div>
              
              {/* Delivery Type Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Delivery Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      deliveryType === 'DELIVERY' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                    onClick={() => setDeliveryType('DELIVERY')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="h-6 w-6 mr-3 text-orange-600" />
                        <span className="font-medium">Delivery</span>
                      </div>
                      <input
                        type="radio"
                        checked={deliveryType === 'DELIVERY'}
                        onChange={() => setDeliveryType('DELIVERY')}
                      />
                    </div>
                  </div>
                  <div
                    className={`p-4 border rounded-lg cursor-pointer ${
                      deliveryType === 'PICKUP' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                    onClick={() => setDeliveryType('PICKUP')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Store className="h-6 w-6 mr-3 text-orange-600" />
                        <span className="font-medium">Pickup from Store</span>
                      </div>
                      <input
                        type="radio"
                        checked={deliveryType === 'PICKUP'}
                        onChange={() => setDeliveryType('PICKUP')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Location - show selected location from cart */}
              {deliveryType === 'DELIVERY' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Delivery Location</h3>
                  
                  <div className="space-y-4">
                    {selectedDeliveryLocation ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              {(() => {
                                const location = deliveryLocations.find(loc => loc.id === selectedDeliveryLocation);
                                return location ? location.name : 'Selected Location';
                              })()} ✅
                            </h4>
                            {(() => {
                              const location = deliveryLocations.find(loc => loc.id === selectedDeliveryLocation);
                              return location && location.description ? (
                                <p className="text-sm text-gray-600 mb-1">
                                  {location.description}
                                </p>
                              ) : null;
                            })()}
                            <p className="text-sm text-green-600">
                              Estimated delivery: {(() => {
                                const location = deliveryLocations.find(loc => loc.id === selectedDeliveryLocation);
                                return location ? `${location.estimatedDays} day(s)` : '1-2 days';
                              })()} 
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-600">
                              {formatPrice(deliveryCost)}
                            </div>
                            <button
                              onClick={() => router.push('/cart')}
                              className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                            >
                              Change location
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : manualDeliveryCost ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">
                              Custom Delivery Location ✅
                            </h4>
                            <p className="text-sm text-gray-600">
                              Manual delivery cost set
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-600">
                              {formatPrice(parseFloat(manualDeliveryCost))}
                            </div>
                            <button
                              onClick={() => router.push('/cart')}
                              className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                            >
                              Change cost
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-center">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            ⚠️ No Delivery Location Selected
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Please go back to your cart to select a delivery location
                          </p>
                          <button
                            onClick={() => router.push('/cart')}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Go to Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Delivery Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>
              
              <div className="flex space-x-4 mt-4">
                <Button
                  variant="outline"
                  onClick={goBackStep}
                  className="flex-1"
                  size="lg"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleDeliverySubmit}
                  disabled={!deliveryType || (deliveryType === 'DELIVERY' && !selectedDeliveryLocation && !manualDeliveryCost)}
                  className="flex-1"
                  size="lg"
                >
                  {deliveryType === 'DELIVERY' && !selectedDeliveryLocation && !manualDeliveryCost 
                    ? 'Select Delivery Location' 
                    : 'Continue to Payment'
                  }
                </Button>
              </div>
            </div>
          )}
          
          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {[
                  { id: 'CASH_ON_DELIVERY', name: 'Cash on Delivery', icon: '💵', description: 'Pay when your order arrives' },
                  { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: '🏦', description: 'Pay via bank transfer or mobile banking' },
                  { id: 'MPESA', name: 'M-Pesa', icon: '📱', description: 'Pay with your M-Pesa mobile money' },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{method.icon}</span>
                        <div>
                          <span className="font-medium text-sm sm:text-base block">{method.name}</span>
                          <span className="text-xs text-gray-500">{method.description}</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
              

              
              <div className="flex space-x-4 mt-4">
                <Button
                  variant="outline"
                  onClick={goBackStep}
                  className="flex-1"
                  size="lg"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={!selectedPaymentMethod}
                  className="flex-1"
                  size="lg"
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}
          
          {/* Review Step */}
          {step === 'review' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Review</h2>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Items ({items.length})</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={getImageUrl(Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? (() => { try { return JSON.parse(item.product.images)[0]; } catch { return null; } })() : null))}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary in Review */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedPromo.code}):</span>
                      <span>-{formatPrice(getDiscountAmount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Delivery:</span>
                    <span>{formatPrice(getCurrentDeliveryCost())}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>
              </div>
              
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name:</span>
                    <span className="text-sm font-medium">{formData.fullName || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="text-sm font-medium">{formData.phone || 'Not provided'}</span>
                  </div>
                  {formData.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm font-medium">{formData.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Delivery & Payment Info */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Delivery & Payment</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Type:</strong> {deliveryType === 'PICKUP' ? 'Pickup from Store' : 'Delivery'}</p>
                  {deliveryType === 'DELIVERY' && (
                    <p><strong>Location:</strong> 
                      {selectedDeliveryLocation 
                        ? `${deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.name} (${formatPrice(deliveryCost)})`
                        : manualDeliveryCost ? `Custom location (${formatPrice(parseFloat(manualDeliveryCost))})` : 'Not specified'
                      }
                    </p>
                  )}
                  <p><strong>Payment:</strong> 
                    {selectedPaymentMethod === 'CASH_ON_DELIVERY' && 'Cash on Delivery'}
                    {selectedPaymentMethod === 'BANK_TRANSFER' && 'Bank Transfer'}
                    {selectedPaymentMethod === 'MPESA' && 'M-Pesa'}
                  </p>
                  {appliedPromo && (
                    <p><strong>Promo Code:</strong> {appliedPromo.code} (-{formatPrice(getDiscountAmount())})</p>
                  )}
                  <p><strong>Order Total:</strong> {formatPrice(getTotal())}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={goBackStep}
                  className="flex-1"
                  size="lg"
                  disabled={loading}
                >
                  ← Back
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  className="flex-1"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 lg:sticky lg:top-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 sm:space-x-3 group p-2 sm:p-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0">
                    <Image
                      src={getImageUrl(Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? (() => { try { return JSON.parse(item.product.images)[0]; } catch { return null; } })() : null))}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 56px, 64px"
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium truncate">{item.product.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <p className="text-sm sm:text-base font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    <button
                      onClick={() => {
                        const { removeFromCart } = useCart.getState();
                        removeFromCart(item.id);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold transition-colors self-end sm:self-auto"
                      title="Remove item"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatPrice(getCurrentDeliveryCost())}</span>
              </div>

              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
            

            
            {/* Promo Code Savings Display */}
            {appliedPromo && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">🎉</span>
                    <span className="text-sm font-medium text-green-800">Promo Applied!</span>
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    Save {formatPrice(getDiscountAmount())}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Code: {appliedPromo.code}
                </p>
              </div>
            )}
            
            <div className="mt-6 text-xs text-gray-600">
              <p className="flex items-center mb-1">
                <Phone className="h-3 w-3 mr-1" />
                Need help? Call +254790 227 760
              </p>
              <p className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                householdplanet819@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
