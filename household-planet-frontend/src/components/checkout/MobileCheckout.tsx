'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheck, 
  FiCreditCard,
  FiTruck,
  FiUser,
  FiShoppingBag
} from 'react-icons/fi';

interface MobileCheckoutProps {
  onComplete: (data: any) => void;
  cartTotal: number;
  cartItems: any[];
}

export default function MobileCheckout({ onComplete, cartTotal, cartItems }: MobileCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      county: ''
    },
    payment: {
      method: 'mpesa',
      mpesaPhone: ''
    }
  });

  const steps = [
    { id: 'shipping', title: 'Shipping', icon: FiTruck },
    { id: 'payment', title: 'Payment', icon: FiCreditCard },
    { id: 'review', title: 'Review', icon: FiCheck }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={prevStep}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-600 hover:text-gray-800 rounded-lg active:bg-gray-100"
            disabled={currentStep === 0}
          >
            <FiChevronLeft size={24} />
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {steps[currentStep].title}
            </h1>
            <p className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          
          <div className="w-11" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? <FiCheck size={16} /> : <Icon size={16} />}
                </div>
              );
            })}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <ShippingForm 
                data={formData.shipping} 
                onChange={(field, value) => updateFormData('shipping', field, value)}
              />
            )}
            
            {currentStep === 1 && (
              <PaymentForm 
                data={formData.payment} 
                onChange={(field, value) => updateFormData('payment', field, value)}
              />
            )}
            
            {currentStep === 2 && (
              <ReviewOrder 
                formData={formData}
                cartItems={cartItems}
                cartTotal={cartTotal}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="btn-mobile flex-1 bg-gray-100 text-gray-700"
            >
              Back
            </button>
          )}
          
          <button
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            className="btn-mobile flex-1 bg-blue-600 text-white"
          >
            {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
            {currentStep < steps.length - 1 && <FiChevronRight className="ml-2" size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShippingForm({ data, onChange }: { data: any; onChange: (field: string, value: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="mobile-card p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiUser className="mr-2" />
          Contact Information
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className="input-mobile"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className="input-mobile"
            />
          </div>
          
          <input
            type="email"
            placeholder="Email Address"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="input-mobile w-full"
          />
          
          <input
            type="tel"
            placeholder="Phone Number"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="input-mobile w-full"
          />
        </div>
      </div>

      <div className="mobile-card p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiTruck className="mr-2" />
          Delivery Address
        </h2>
        
        <div className="space-y-4">
          <textarea
            placeholder="Street Address"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            className="input-mobile w-full resize-none"
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="input-mobile"
            />
            <select
              value={data.county}
              onChange={(e) => onChange('county', e.target.value)}
              className="input-mobile"
            >
              <option value="">Select County</option>
              <option value="nairobi">Nairobi</option>
              <option value="mombasa">Mombasa</option>
              <option value="kisumu">Kisumu</option>
              <option value="nakuru">Nakuru</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ data, onChange }: { data: any; onChange: (field: string, value: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="mobile-card p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiCreditCard className="mr-2" />
          Payment Method
        </h2>
        
        <div className="space-y-3">
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="mpesa"
              checked={data.method === 'mpesa'}
              onChange={(e) => onChange('method', e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded mr-3 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-medium">M-Pesa</span>
            </div>
          </label>
          
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={data.method === 'card'}
              onChange={(e) => onChange('method', e.target.value)}
              className="mr-3"
            />
            <div className="flex items-center">
              <FiCreditCard className="w-8 h-8 mr-3 text-blue-600" />
              <span className="font-medium">Credit/Debit Card</span>
            </div>
          </label>
        </div>
        
        {data.method === 'mpesa' && (
          <div className="mt-4">
            <input
              type="tel"
              placeholder="M-Pesa Phone Number (254...)"
              value={data.mpesaPhone}
              onChange={(e) => onChange('mpesaPhone', e.target.value)}
              className="input-mobile w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewOrder({ formData, cartItems, cartTotal }: { formData: any; cartItems: any[]; cartTotal: number }) {
  return (
    <div className="space-y-4">
      <div className="mobile-card p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiShoppingBag className="mr-2" />
          Order Summary
        </h2>
        
        <div className="space-y-3">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">KSh {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-bold text-blue-600">KSh {cartTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mobile-card p-4">
        <h3 className="font-semibold mb-2">Delivery Address</h3>
        <p className="text-gray-600">
          {formData.shipping.firstName} {formData.shipping.lastName}<br />
          {formData.shipping.address}<br />
          {formData.shipping.city}, {formData.shipping.county}<br />
          {formData.shipping.phone}
        </p>
      </div>

      <div className="mobile-card p-4">
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p className="text-gray-600">
          {formData.payment.method === 'mpesa' ? 'M-Pesa' : 'Credit/Debit Card'}
          {formData.payment.mpesaPhone && ` - ${formData.payment.mpesaPhone}`}
        </p>
      </div>
    </div>
  );
}