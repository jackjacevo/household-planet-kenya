'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { FiCheck, FiCreditCard, FiTruck, FiUser, FiMapPin } from 'react-icons/fi';

interface DeliveryLocation {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  county: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { state, getGuestCartTotal, clearCart, clearGuestCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // Form data
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    county: '',
    type: 'HOME'
  });
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [createAccount, setCreateAccount] = useState(false);

  const cartItems = user ? state.items : state.guestCart;
  const cartTotal = user ? state.total : getGuestCartTotal();
  const finalTotal = user ? (state.finalTotal || state.total) : getGuestCartTotal();
  const selectedLocation = deliveryLocations.find(loc => loc.id === selectedDeliveryLocation);
  const deliveryCost = selectedLocation?.price || 0;
  const grandTotal = finalTotal + deliveryCost;

  useEffect(() => {
    fetchDeliveryLocations();
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchDeliveryLocations = async () => {
    try {
      const response = await api.get('/delivery/locations');
      setDeliveryLocations(response.data);
    } catch (error) {
      console.error('Failed to fetch delivery locations:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data);
      const defaultAddress = response.data.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleStepChange = (step: number) => {
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestInfo.email && guestInfo.firstName && guestInfo.lastName && guestInfo.phone) {
      setCurrentStep(2);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && selectedAddress) {
      setCurrentStep(3);
    } else if (!user && newAddress.street && newAddress.city && newAddress.county) {
      setCurrentStep(3);
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeliveryLocation) {
      setCurrentStep(4);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'MPESA' && !mpesaPhone) return;
    setCurrentStep(5);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      let orderData;
      
      if (user) {
        // Authenticated user order
        const addressData = addresses.find(addr => addr.id === selectedAddress);
        const shippingAddress = `${addressData?.street}, ${addressData?.city}, ${addressData?.county}`;
        
        orderData = {
          shippingAddress,
          deliveryLocation: selectedDeliveryLocation,
          paymentMethod,
          phoneNumber: paymentMethod === 'MPESA' ? mpesaPhone : undefined
        };
        
        const response = await api.post('/orders/from-cart', orderData);
        await clearCart();
        router.push(`/orders/${response.data.order.id}/confirmation`);
      } else {
        // Guest checkout
        const shippingAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.county}`;
        
        orderData = {
          items: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          })),
          email: guestInfo.email,
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone,
          shippingAddress,
          deliveryLocation: selectedDeliveryLocation,
          paymentMethod,
          phoneNumber: paymentMethod === 'MPESA' ? mpesaPhone : undefined
        };
        
        const response = await api.post('/orders/guest-checkout', orderData);
        clearGuestCart();
        router.push(`/orders/guest/${response.data.order.orderNumber}/confirmation?email=${guestInfo.email}`);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: user ? 'Review Cart' : 'Guest Information', icon: FiUser },
    { id: 2, name: 'Shipping Address', icon: FiMapPin },
    { id: 3, name: 'Delivery Options', icon: FiTruck },
    { id: 4, name: 'Payment Method', icon: FiCreditCard },
    { id: 5, name: 'Review Order', icon: FiCheck }
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to proceed with checkout</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step.id <= currentStep
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`ml-4 text-sm font-medium ${
                      step.id <= currentStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 left-5 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Step 1: Guest Information or Cart Review */}
            {currentStep === 1 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                {!user ? (
                  <>
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Guest Information</h2>
                    <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            required
                            value={guestInfo.firstName}
                            onChange={(e) => setGuestInfo({...guestInfo, firstName: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            required
                            value={guestInfo.lastName}
                            onChange={(e) => setGuestInfo({...guestInfo, lastName: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          required
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createAccount}
                          onChange={(e) => setCreateAccount(e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Create an account for faster checkout next time
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        Continue to Shipping
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Review Your Cart</h2>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md"></div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            KES {((item.variant?.price || item.product.price) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Continue to Shipping
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  {user && addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-center">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm text-gray-900">
                            <div className="font-medium">{address.type}</div>
                            <div className="text-gray-500">{address.street}, {address.city}, {address.county}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">County</label>
                          <input
                            type="text"
                            required
                            value={newAddress.county}
                            onChange={(e) => setNewAddress({...newAddress, county: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Continue to Delivery
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Delivery Options */}
            {currentStep === 3 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Delivery Options</h2>
                <form onSubmit={handleDeliverySubmit} className="space-y-4">
                  <div className="space-y-3">
                    {deliveryLocations.map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="delivery"
                            value={location.id}
                            checked={selectedDeliveryLocation === location.id}
                            onChange={(e) => setSelectedDeliveryLocation(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{location.name}</div>
                            <div className="text-sm text-gray-500">Delivery in {location.estimatedDays}</div>
                          </div>
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          KES {location.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Step 4: Payment Method */}
            {currentStep === 4 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="MPESA"
                        checked={paymentMethod === 'MPESA'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-900">M-Pesa</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-900">Credit/Debit Card</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-900">Cash on Delivery</label>
                    </div>
                  </div>
                  
                  {paymentMethod === 'MPESA' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="254XXXXXXXXX"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Review Order
                  </button>
                </form>
              </div>
            )}

            {/* Step 5: Review Order */}
            {currentStep === 5 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Review Your Order</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product.name} x {item.quantity}</span>
                          <span>KES {((item.variant?.price || item.product.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <p className="text-sm text-gray-600">
                      {user && selectedAddress 
                        ? (() => {
                            const addr = addresses.find(a => a.id === selectedAddress);
                            return `${addr?.street}, ${addr?.city}, ${addr?.county}`;
                          })()
                        : `${newAddress.street}, ${newAddress.city}, ${newAddress.county}`
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Delivery</h3>
                    <p className="text-sm text-gray-600">
                      {selectedLocation?.name} - KES {selectedLocation?.price.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-600">
                      {paymentMethod === 'MPESA' ? `M-Pesa (${mpesaPhone})` : 
                       paymentMethod === 'CARD' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : `Place Order - KES ${grandTotal.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow-sm rounded-lg px-4 py-6 sm:p-6 lg:p-8 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">KES {cartTotal.toLocaleString()}</dd>
                </div>
                
                {user && state.promo && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-green-600">Discount</dt>
                    <dd className="text-sm font-medium text-green-600">-KES {state.promo.discount.toLocaleString()}</dd>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Delivery</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedLocation ? `KES ${selectedLocation.price.toLocaleString()}` : 'Select delivery option'}
                  </dd>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">KES {grandTotal.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}