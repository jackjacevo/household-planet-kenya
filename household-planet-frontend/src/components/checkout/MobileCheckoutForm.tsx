'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check, CreditCard, Smartphone, Banknote } from 'lucide-react';

interface MobileCheckoutFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function MobileCheckoutForm({ onSubmit, loading = false }: MobileCheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    paymentMethod: '',
  });

  const steps = [
    { title: 'Contact', fields: ['email', 'phone'] },
    { title: 'Delivery', fields: ['fullName', 'address', 'city'] },
    { title: 'Payment', fields: ['paymentMethod'] },
  ];

  const paymentMethods = [
    { id: 'MPESA', name: 'M-Pesa', icon: Smartphone, description: 'Pay with M-Pesa' },
    { id: 'CARD', name: 'Card', icon: CreditCard, description: 'Credit/Debit Card' },
    { id: 'COD', name: 'Cash on Delivery', icon: Banknote, description: 'Pay when delivered' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const currentFields = steps[currentStep].fields;
    return currentFields.every(field => formData[field as keyof typeof formData]);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-white text-sm">
            {steps[currentStep].title}
          </span>
        </div>
        <div className="w-full bg-green-400 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Contact Step */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="+254 700 000 000"
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          {/* Delivery Step */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Street address, building, apartment"
                  autoComplete="street-address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nairobi"
                  autoComplete="address-level2"
                />
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose Payment Method
              </h3>
              
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleInputChange('paymentMethod', method.id)}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                      formData.paymentMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.paymentMethod === method.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                      {formData.paymentMethod === method.id && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex space-x-3">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 min-h-touch"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="flex-1 py-4 px-6 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 min-h-touch"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
                </span>
                {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileCheckoutForm;
