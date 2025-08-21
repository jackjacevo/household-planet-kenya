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
    <div className=\"max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden\">
      {/* Progress Bar */}\n      <div className=\"bg-gradient-to-r from-green-500 to-green-600 p-4\">\n        <div className=\"flex items-center justify-between mb-2\">\n          <span className=\"text-white text-sm font-medium\">\n            Step {currentStep + 1} of {steps.length}\n          </span>\n          <span className=\"text-white text-sm\">\n            {steps[currentStep].title}\n          </span>\n        </div>\n        <div className=\"w-full bg-green-400 rounded-full h-2\">\n          <div \n            className=\"bg-white h-2 rounded-full transition-all duration-300\"\n            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}\n          />\n        </div>\n      </div>\n\n      {/* Form Content */}\n      <div className=\"p-6\">\n        <motion.div\n          key={currentStep}\n          initial={{ opacity: 0, x: 20 }}\n          animate={{ opacity: 1, x: 0 }}\n          exit={{ opacity: 0, x: -20 }}\n          transition={{ duration: 0.3 }}\n        >\n          {/* Contact Step */}\n          {currentStep === 0 && (\n            <div className=\"space-y-6\">\n              <div>\n                <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                  Email Address\n                </label>\n                <input\n                  type=\"email\"\n                  value={formData.email}\n                  onChange={(e) => handleInputChange('email', e.target.value)}\n                  className=\"w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200\"\n                  placeholder=\"your@email.com\"\n                  autoComplete=\"email\"\n                />\n              </div>\n              \n              <div>\n                <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                  Phone Number\n                </label>\n                <input\n                  type=\"tel\"\n                  value={formData.phone}\n                  onChange={(e) => handleInputChange('phone', e.target.value)}\n                  className=\"w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200\"\n                  placeholder=\"+254 700 000 000\"\n                  autoComplete=\"tel\"\n                />\n              </div>\n            </div>\n          )}\n\n          {/* Delivery Step */}\n          {currentStep === 1 && (\n            <div className=\"space-y-6\">\n              <div>\n                <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                  Full Name\n                </label>\n                <input\n                  type=\"text\"\n                  value={formData.fullName}\n                  onChange={(e) => handleInputChange('fullName', e.target.value)}\n                  className=\"w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200\"\n                  placeholder=\"John Doe\"\n                  autoComplete=\"name\"\n                />\n              </div>\n              \n              <div>\n                <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                  Delivery Address\n                </label>\n                <textarea\n                  value={formData.address}\n                  onChange={(e) => handleInputChange('address', e.target.value)}\n                  rows={3}\n                  className=\"w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none\"\n                  placeholder=\"Street address, building, apartment\"\n                  autoComplete=\"street-address\"\n                />\n              </div>\n              \n              <div>\n                <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                  City\n                </label>\n                <input\n                  type=\"text\"\n                  value={formData.city}\n                  onChange={(e) => handleInputChange('city', e.target.value)}\n                  className=\"w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200\"\n                  placeholder=\"Nairobi\"\n                  autoComplete=\"address-level2\"\n                />\n              </div>\n            </div>\n          )}\n\n          {/* Payment Step */}\n          {currentStep === 2 && (\n            <div className=\"space-y-4\">\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">\n                Choose Payment Method\n              </h3>\n              \n              {paymentMethods.map((method) => {\n                const Icon = method.icon;\n                return (\n                  <button\n                    key={method.id}\n                    onClick={() => handleInputChange('paymentMethod', method.id)}\n                    className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${\n                      formData.paymentMethod === method.id\n                        ? 'border-green-500 bg-green-50'\n                        : 'border-gray-200 hover:border-gray-300'\n                    }`}\n                  >\n                    <div className=\"flex items-center space-x-3\">\n                      <div className={`p-2 rounded-lg ${\n                        formData.paymentMethod === method.id\n                          ? 'bg-green-500 text-white'\n                          : 'bg-gray-100 text-gray-600'\n                      }`}>\n                        <Icon className=\"h-5 w-5\" />\n                      </div>\n                      <div className=\"flex-1\">\n                        <div className=\"font-medium text-gray-900\">{method.name}</div>\n                        <div className=\"text-sm text-gray-500\">{method.description}</div>\n                      </div>\n                      {formData.paymentMethod === method.id && (\n                        <Check className=\"h-5 w-5 text-green-500\" />\n                      )}\n                    </div>\n                  </button>\n                );\n              })}\n            </div>\n          )}\n        </motion.div>\n      </div>\n\n      {/* Navigation Buttons */}\n      <div className=\"p-6 bg-gray-50 border-t\">\n        <div className=\"flex space-x-3\">\n          {currentStep > 0 && (\n            <button\n              onClick={handleBack}\n              className=\"flex-1 py-4 px-6 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 min-h-touch\"\n            >\n              Back\n            </button>\n          )}\n          \n          <button\n            onClick={handleNext}\n            disabled={!isStepValid() || loading}\n            className=\"flex-1 py-4 px-6 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 min-h-touch\"\n          >\n            {loading ? (\n              <div className=\"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin\" />\n            ) : (\n              <>\n                <span>\n                  {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}\n                </span>\n                {currentStep < steps.length - 1 && <ChevronRight className=\"h-4 w-4\" />}\n              </>\n            )}\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n}