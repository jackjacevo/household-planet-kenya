'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { usePayment } from '@/hooks/usePayment';
import { useDelivery } from '@/hooks/useDelivery';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { PaymentStatus } from '@/components/payment/PaymentStatus';
import { formatPrice } from '@/lib/utils';
import { MapPin, Phone, Mail, User, Check, ChevronRight, Plus, Edit2, Truck, Store } from 'lucide-react';
import { Address } from '@/types';
import axios from 'axios';
import Image from 'next/image';

type CheckoutStep = 'account' | 'delivery' | 'payment' | 'review' | 'processing';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { initiatePayment, retryPayment, loading } = usePayment();
  const { calculateDeliveryCost, deliveryLocations } = useDelivery();
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
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const user = response.data;
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        phone: user.phone || ''
      }));
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
      
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.product.price
        })),
        deliveryLocationId: selectedDeliveryLocation,
        deliveryPrice: deliveryCost,
        paymentMethod: selectedPaymentMethod,
        notes: formData.notes,
      };
      
      console.log('Creating order with data:', orderData);
      console.log('Selected delivery location:', deliveryLocations.find(loc => loc.id === selectedDeliveryLocation));
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        orderData,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );
      return response.data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handleAccountStep = () => {
    if (isGuest && formData.createAccount) {
      // Create account logic here
    }
    setStep('delivery');
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
      const newOrderId = await createOrder();
      setOrderId(newOrderId);
      
      if (selectedPaymentMethod === 'CASH' || selectedPaymentMethod === 'BANK') {
        clearCart();
        // Add a flag to indicate successful order creation
        localStorage.setItem('orderCreated', 'true');
        router.push(`/order-confirmation/${newOrderId}`);
      } else {
        await initiatePayment({
          orderId: newOrderId,
          paymentMethod: selectedPaymentMethod,
          phoneNumber: formData.phone,
        });
        setStep('processing');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Order failed. Please try again.');
    }
  };

  const handlePaymentComplete = () => {
    clearCart();
    // Add a flag to indicate successful order creation
    localStorage.setItem('orderCreated', 'true');
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
  const getTotal = () => {
    let deliveryFee = 0;
    if (deliveryType === 'DELIVERY') {
      if (selectedDeliveryLocation) {
        deliveryFee = deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.price || 0;
      } else if (manualDeliveryCost) {
        deliveryFee = parseFloat(manualDeliveryCost) || 0;
      }
    }
    return getTotalPrice() + deliveryFee;
  };

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
    <div className="container mx-auto px-3 sm:px-4 py-4 md:py-8 pb-20 md:pb-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Checkout</h1>
      
      {/* Progress Indicator */}
      <div className="mb-6 md:mb-8">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                    <label className="block text-sm font-medium mb-2">Full Name</label>
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
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+254700000000"
                    />
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
              
              {/* Delivery Location - only show if delivery is selected */}
              {deliveryType === 'DELIVERY' && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Delivery Location</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Delivery Location</label>
                      <select 
                        value={selectedDeliveryLocation}
                        onChange={(e) => {
                          const locationId = e.target.value;
                          setSelectedDeliveryLocation(locationId);
                          if (locationId) {
                            const location = deliveryLocations.find(loc => loc.id === locationId);
                            if (location) {
                              const originalPrice = location.price;
                              let cost = originalPrice;
                              // Apply free shipping if order value is above threshold
                              if (getTotalPrice() >= 5000) {
                                cost = 0;
                              }
                              setDeliveryCost(cost);
                              setManualDeliveryCost(originalPrice.toString());
                            }
                          } else {
                            setManualDeliveryCost('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="">Select delivery location</option>
                        {deliveryLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {formatPrice(location.price)}
                            {location.description ? ` (${location.description})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedDeliveryLocation && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="text-center">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">
                            {deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.description}
                          </p>
                          <p className="text-sm text-green-600 mb-3">
                            Estimated delivery: {deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.estimatedDays} day(s)
                          </p>
                          <div className="text-2xl font-bold">
                            <span className="text-orange-600">
                              {formatPrice(deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.price || 0)}
                            </span>
                          </div>

                        </div>
                      </div>
                    )}
                    
                    <div className="text-center text-sm text-gray-500">OR</div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Manual Delivery Cost (KSh)</label>
                      <Input
                        type="number"
                        placeholder="Enter delivery cost"
                        value={manualDeliveryCost}
                        onChange={(e) => {
                          setManualDeliveryCost(e.target.value);
                          const cost = parseFloat(e.target.value) || 0;
                          setDeliveryCost(cost);
                          setSelectedDeliveryLocation('');
                        }}
                        min="0"
                        step="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use this if your location is not listed above
                      </p>
                    </div>
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
              
              <Button
                onClick={handleDeliverySubmit}
                disabled={!deliveryType || (deliveryType === 'DELIVERY' && !selectedDeliveryLocation && !manualDeliveryCost)}
                className="w-full mt-4"
                size="lg"
              >
                Continue to Payment
              </Button>
            </div>
          )}
          
          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'CASH', name: 'Cash on Delivery', icon: '💵' },
                  { id: 'PAYBILL', name: 'Paybill', icon: '📱' },
                  { id: 'BANK', name: 'Bank on Delivery', icon: '🏦' },
                  { id: 'MPESA', name: 'M-Pesa', icon: '📱' },

                ].map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedPaymentMethod === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handlePaymentSubmit}
                disabled={!selectedPaymentMethod}
                className="w-full mt-4 min-h-44"
                size="lg"
              >
                Review Order
              </Button>
            </div>
          )}
          
          {/* Review Step */}
          {step === 'review' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Review</h2>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={item.product.images[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          fill
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
              </div>
              
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="text-sm text-gray-600">
                  <p>{formData.fullName}</p>
                  <p>{formData.phone}</p>
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
                        ? deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.name
                        : manualDeliveryCost ? `Custom location (${formatPrice(parseFloat(manualDeliveryCost) || 0)})` : 'Not specified'
                      }
                    </p>
                  )}
                  <p><strong>Payment:</strong> 
                    {selectedPaymentMethod === 'CASH' && 'Cash on Delivery'}
                    {selectedPaymentMethod === 'PAYBILL' && 'Paybill'}
                    {selectedPaymentMethod === 'BANK' && 'Bank on Delivery'}
                    {selectedPaymentMethod === 'MPESA' && 'M-Pesa'}

                  </p>
                </div>
              </div>
              
              <Button
                onClick={handlePlaceOrder}
                className="w-full min-h-44"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          )}
        </div>
        
        <div className="order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-4">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Cost</span>
                <span>
                  {deliveryType === 'PICKUP' ? (
                    formatPrice(0)
                  ) : selectedDeliveryLocation ? (
                    formatPrice(deliveryLocations.find(loc => loc.id === selectedDeliveryLocation)?.price || 0)
                  ) : manualDeliveryCost ? (
                    formatPrice(parseFloat(manualDeliveryCost) || 0)
                  ) : (
                    'TBD'
                  )}
                </span>
              </div>

              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
            
            {/* Free Shipping Progress */}
            {deliveryType === 'DELIVERY' && getTotalPrice() < 5000 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Free Shipping Progress</span>
                  <span className="text-xs text-blue-600">
                    {formatPrice(5000 - getTotalPrice())} to go!
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((getTotalPrice() / 5000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  🚚 Add {formatPrice(5000 - getTotalPrice())} more for free delivery!
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
